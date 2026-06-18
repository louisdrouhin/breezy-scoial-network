import { verifyToken } from '../utils/jwt.util.js';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Missing authorization header' });
  }

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Invalid authorization format. Expected: Bearer <token>' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export { authenticate };
