import { hashPassword, comparePassword } from '../utils/bcrypt.util.js';
import { generateToken } from '../utils/jwt.util.js';
import { Account, RefreshToken } from '../models/index.js';
import crypto from 'crypto';

async function register(username, email, password) {
  if (!username || !email || !password) {
    throw new Error('Username, email and password are required');
  }

  const existingByUsername = await Account.findByPk(username);

  if (existingByUsername) {
    throw new Error('Username already exists');
  }

  const existingByEmail = await Account.findOne({
    where: { email },
  });

  if (existingByEmail) {
    throw new Error('Email already exists');
  }

  const passwordHash = await hashPassword(password);

  const newAccount = await Account.create({
    username,
    email,
    passwordHash,
    role: 'USER',
  });

  try {
    const res = await fetch('http://user-svc:3002/internal/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        displayName: null,
        bio: null,
        avatarUrl: null,
        bannerUrl: null,
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`User service error: ${res.status} - ${errorBody}`);
    }

    await res.json();
  } catch (err) {
    await newAccount.destroy();
    throw new Error(`Registration failed: could not create user profile - ${err.message}`);
  }

  return { username: newAccount.username, email: newAccount.email, role: newAccount.role };
}

async function login(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const account = await Account.findOne({
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

  await RefreshToken.create({
    tokenHash: refreshTokenHash,
    expiresAt,
    accountUsername: account.username,
  });

  return { accessToken, refreshToken, username: account.username, role: account.role };
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const storedToken = await RefreshToken.findOne({
    where: { tokenHash: refreshTokenHash },
    include: [{ model: Account, as: 'Account' }],
  });

  if (!storedToken) {
    throw new Error('Invalid refresh token');
  }

  if (new Date() > storedToken.expiresAt) {
    await storedToken.destroy();
    throw new Error('Refresh token expired');
  }

  const account = storedToken.Account;

  const newAccessToken = generateToken({
    username: account.username,
    email: account.email,
    role: account.role,
  });

  const newRefreshToken = crypto.randomBytes(32).toString('hex');
  const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await storedToken.destroy();

  await RefreshToken.create({
    tokenHash: newRefreshTokenHash,
    expiresAt: newExpiresAt,
    accountUsername: account.username,
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken, username: account.username, role: account.role };
}

async function logout(refreshToken) {
  if (!refreshToken) {
    throw new Error('Refresh token is required');
  }

  const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

  const token = await RefreshToken.findOne({
    where: { tokenHash: refreshTokenHash },
  });

  if (!token) {
    throw new Error('Refresh token not found');
  }

  await token.destroy();
}

export { register, login, refresh, logout };
