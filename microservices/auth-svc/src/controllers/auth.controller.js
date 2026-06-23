import * as authService from '../services/auth.service.js';
import { verifyToken } from '../utils/jwt.util.js';

async function register(req, res) {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register(username, email, password);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, username, role } = await authService.login(email, password);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return user info but NOT the token (it's in httpOnly cookie)
    res.status(200).json({ username, email, role });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function refresh(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { accessToken, refreshToken: newRefreshToken } = await authService.refresh(refreshToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Return success status only (token is in httpOnly cookie)
    res.status(200).json({ message: 'Token refreshed' });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(204).send();
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

function validate(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  res.set('X-User-Username', req.user.username);
  res.set('X-User-Role', req.user.role);

  return res.status(200).json({ message: 'Token is valid' });
}

function validateCookie(req, res) {
  // Check if the httpOnly accessToken cookie exists
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: 'No token cookie found' });
  }

  try {
    // Verify the token from the cookie
    const decoded = verifyToken(accessToken);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.set('X-User-Username', decoded.username);
    res.set('X-User-Role', decoded.role);
    return res.status(200).json({ username: decoded.username, role: decoded.role });
  } catch (err) {
    return res.status(401).json({ message: 'Token verification failed' });
  }
}

async function updateAccount(req, res) {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) return res.status(401).json({ message: 'Non authentifié' });

  let username;
  try {
    const decoded = verifyToken(accessToken);
    username = decoded.username;
  } catch {
    return res.status(401).json({ message: 'Token invalide' });
  }

  const { email, password, currentPassword } = req.body;
  if (!currentPassword) return res.status(400).json({ message: 'Le mot de passe actuel est requis' });
  if (!email && !password) return res.status(400).json({ message: 'Aucune modification fournie' });

  try {
    const result = await authService.updateAccount(username, { email, password, currentPassword });
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

export { register, login, refresh, logout, validate, validateCookie, updateAccount };
