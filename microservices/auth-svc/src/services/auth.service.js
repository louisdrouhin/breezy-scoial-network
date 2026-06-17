import { hashPassword, comparePassword } from '../utils/bcrypt.util.js';
import { generateToken, verifyToken } from '../utils/jwt.util.js';
import prisma from '../config/database.config.js';
import crypto from 'crypto';

async function register(username, email, password) {
  if (!username || !email || !password) {
    throw new Error('Username, email and password are required');
  }

  const existingByUsername = await prisma.account.findUnique({
    where: { username },
  });

  if (existingByUsername) {
    throw new Error('Username already exists');
  }

  const existingByEmail = await prisma.account.findUnique({
    where: { email },
  });

  if (existingByEmail) {
    throw new Error('Email already exists');
  }

  const passwordHash = await hashPassword(password);

  const newAccount = await prisma.account.create({
    data: {
      username,
      email,
      passwordHash,
      role: 'USER',
    },
  });

  return { username: newAccount.username, email: newAccount.email, role: newAccount.role };
}

async function login(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const account = await prisma.account.findUnique({
    where: { email },
  });

  if (!account) {
    throw new Error('Invalid credentials');
  }

  const isValid = await comparePassword(password, account.passwordHash);

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const accessToken = generateToken({
    username: account.username,
    email: account.email,
    role: account.role,
  });

  const refreshToken = crypto.randomBytes(32).toString('hex');
  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      expiresAt,
      accountUsername: account.username,
    },
  });

  return { accessToken, refreshToken };
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash: refreshTokenHash },
    include: { account: true },
  });

  if (!storedToken) {
    throw new Error('Invalid refresh token');
  }

  if (new Date() > storedToken.expiresAt) {
    await prisma.refreshToken.delete({ where: { tokenHash: refreshTokenHash } });
    throw new Error('Refresh token expired');
  }

  const account = storedToken.account;

  const newAccessToken = generateToken({
    username: account.username,
    email: account.email,
    role: account.role,
  });

  const newRefreshToken = crypto.randomBytes(32).toString('hex');
  const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.delete({ where: { tokenHash: refreshTokenHash } });

  await prisma.refreshToken.create({
    data: {
      tokenHash: newRefreshTokenHash,
      expiresAt: newExpiresAt,
      accountUsername: account.username,
    },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

async function logout(refreshToken) {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const deleted = await prisma.refreshToken.delete({
    where: { tokenHash: refreshTokenHash },
  }).catch(() => null);

  if (!deleted) {
    throw new Error('Refresh token not found');
  }
}

export { register, login, refresh, logout };
