import bcrypt from 'bcryptjs';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export { hashPassword, comparePassword };
