import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function decodeToken(token) {
  return jwt.decode(token);
}

export { generateToken, verifyToken, decodeToken };
