import express from 'express';
import { authMiddleware } from '../../../jwt/authMiddleware.js';
import { config } from '../config.js';
import { userQueries, messageQueries } from '../db.js';

export const messageRoutes = express.Router();

const requireAuth = authMiddleware(config.jwtPublicKey);

const normalizeEmail = (email) => {
  return String(email || '').trim().toLowerCase();
};

const isFilledString = (value) => {
  return typeof value === 'string' && value.trim() !== '';
};

const isValidIsoDate = (value) => {
  if (!isFilledString(value)) {
    return false;
  }

  const timestamp = Date.parse(value);
  return !Number.isNaN(timestamp);
};

messageRoutes.post('/messages', requireAuth, (req, res, next) => {
  try {
    const senderEmail = normalizeEmail(req.body.sender_email);
    const receiverEmail = normalizeEmail(req.body.receiver_email);
    const { ciphertext, iv, mac, timestamp } = req.body;

    if (
      !isFilledString(senderEmail) ||
      !isFilledString(receiverEmail) ||
      !isFilledString(ciphertext) ||
      !isFilledString(iv) ||
      !isFilledString(mac) ||
      !isValidIsoDate(timestamp)
    ) {
      return res.status(400).json({ error: 'Missing or invalid message fields' });
    }

    if (senderEmail !== req.user.email) {
      return res.status(403).json({ error: 'Sender does not match authenticated user' });
    }

    const receiver = userQueries.findByEmail.get(receiverEmail);

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    messageQueries.insert.run(
      senderEmail,
      receiverEmail,
      ciphertext,
      iv,
      mac,
      timestamp
    );

    return res.status(201).json({ message: 'Message sent' });
  } catch (err) {
    return next(err);
  }
});

messageRoutes.get('/messages/:contactEmail', requireAuth, (req, res) => {
  const currentUserEmail = req.user.email;
  const contactEmail = normalizeEmail(req.params.contactEmail);
  const since = req.query.since ? String(req.query.since) : null;

  if (!isFilledString(contactEmail)) {
    return res.status(400).json({ error: 'Invalid contact email' });
  }

  if (since !== null && !isValidIsoDate(since)) {
    return res.status(400).json({ error: 'Invalid since timestamp' });
  }

  const contact = userQueries.findByEmail.get(contactEmail);

  if (!contact) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  const messages = messageQueries.findConversation.all(
    contactEmail,
    currentUserEmail,
    currentUserEmail,
    contactEmail,
    since,
    since
  );

  return res.status(200).json(messages);
});