import express from 'express';
import bcrypt from 'bcrypt';
import { sign } from '../../../jwt/jwt.js';
import { authMiddleware } from '../../../jwt/authMiddleware.js';
import { config } from '../config.js';
import { userQueries } from '../db.js';

export const authRoutes = express.Router();

const requireAuth = authMiddleware(config.jwtPublicKey);

const normalizeEmail = (email) => {
  return String(email || '').trim().toLowerCase();
};

const isFilledString = (value) => {
  return typeof value === 'string' && value.trim() !== '';
};

const validateRegisterBody = (body) => {
  const requiredFields = [
    'email',
    'password',
    'publicKey',
    'encryptedPrivateKey',
    'iv',
    'salt'
  ];

  return requiredFields.every((field) => isFilledString(body[field]));
};

const setJwtCookie = (res, token) => {
  res.cookie(config.jwtCookieName, token, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    maxAge: config.jwtExpiresInSeconds * 1000,
    path: '/'
  });
};

authRoutes.post('/register', async (req, res, next) => {
  try {
    if (!validateRegisterBody(req.body)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const email = normalizeEmail(req.body.email);
    const {
      password,
      publicKey,
      encryptedPrivateKey,
      iv,
      salt
    } = req.body;

    const existingUser = userQueries.findByEmail.get(email);

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    userQueries.insert.run(
      email,
      passwordHash,
      publicKey,
      encryptedPrivateKey,
      iv,
      salt
    );

    return res.status(201).json({
      message: 'User registered successfully'
    });
  } catch (err) {
    return next(err);
  }
});

authRoutes.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    if (!isFilledString(email) || !isFilledString(password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userQueries.findByEmail.get(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const now = Math.floor(Date.now() / 1000);

    const token = sign(
      {
        alg: config.jwtAlg,
        typ: 'JWT'
      },
      {
        email
      },
      {
        iss: config.jwtIssuer,
        sub: email,
        aud: config.jwtAudience,
        iat: now,
        nbf: now,
        exp: now + config.jwtExpiresInSeconds,
        jti: globalThis.crypto.randomUUID()
      },
      config.jwtPrivateKey
    );

    setJwtCookie(res, token);

    return res.status(200).json({
      publicKey: user.public_key,
      encryptedPrivateKey: user.encrypted_private_key,
      iv: user.iv,
      salt: user.salt
    });
  } catch (err) {
    return next(err);
  }
});

authRoutes.post('/logout', requireAuth, (req, res) => {
  res.clearCookie(config.jwtCookieName, {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: 'lax',
    path: '/'
  });

  return res.status(200).json({ message: 'Logged out' });
});