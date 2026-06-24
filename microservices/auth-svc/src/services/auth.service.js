import { hashPassword, comparePassword } from '../utils/bcrypt.util.js';
import { generateToken } from '../utils/jwt.util.js';
import { Account, RefreshToken } from '../models/index.js';
import crypto from 'crypto';

// Règles de format dupliquées côté front (lib/validation.ts) — le back fait foi.
const USERNAME_RE = /^[a-zA-Z0-9_]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(username, email, password, displayName) {
  if (!username || !email || !password || !displayName) {
    throw new Error('Username, display name, email and password are required');
  }

  if (!USERNAME_RE.test(username)) {
    throw new Error('Username must be 3-30 characters (letters, digits and underscore only)');
  }
  const trimmedDisplayName = displayName.trim();
  if (trimmedDisplayName.length < 1 || trimmedDisplayName.length > 50) {
    throw new Error('Display name must be between 1 and 50 characters');
  }
  if (email.length > 255 || !EMAIL_RE.test(email)) {
    throw new Error('Invalid email address');
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
        displayName: trimmedDisplayName,
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

async function updateAccount(username, { email, password, currentPassword }) {
  const account = await Account.findByPk(username);
  if (!account) throw new Error('Account not found');

  // Mot de passe actuel obligatoire pour toute modification
  const isValid = await comparePassword(currentPassword, account.passwordHash);
  if (!isValid) throw new Error('Mot de passe actuel incorrect');

  const updates = {};

  if (email && email !== account.email) {
    const existing = await Account.findOne({ where: { email } });
    if (existing) throw new Error('Email déjà utilisé');
    updates.email = email;
  }

  if (password) {
    if (password.length < 8) throw new Error('Le mot de passe doit faire au moins 8 caractères');
    updates.passwordHash = await hashPassword(password);
  }

  if (Object.keys(updates).length === 0) throw new Error('Aucune modification détectée');

  await account.update(updates);
  return { username: account.username, email: updates.email ?? account.email };
}

export { register, login, refresh, logout, updateAccount };
