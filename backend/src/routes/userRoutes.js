import express from 'express';
import { authMiddleware } from '../../../jwt/authMiddleware.js';
import { config } from '../config.js';
import { userQueries } from '../db.js';

export const userRoutes = express.Router();

const requireAuth = authMiddleware(config.jwtPublicKey);

const normalizeEmail = (email) => {
  return String(email || '').trim().toLowerCase();
};

userRoutes.get('/contacts', requireAuth, (req, res) => {
  const contacts = userQueries.findContactsExcept.all(req.user.email);
  return res.status(200).json(contacts);
});

userRoutes.get('/users/:email/publicKey', requireAuth, (req, res) => {
  const email = normalizeEmail(req.params.email);
  const user = userQueries.findPublicKey.get(email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.type('text/plain');
  return res.status(200).send(user.public_key);
});