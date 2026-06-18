import * as authService from '../services/auth.service.js';

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

export { register, login, refresh, logout, validate };
