import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from './config.js';

const dbDir = path.dirname(config.databasePath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(config.databasePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  public_key TEXT NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  iv TEXT NOT NULL,
  salt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_email TEXT NOT NULL,
  receiver_email TEXT NOT NULL,
  ciphertext TEXT NOT NULL,
  iv TEXT NOT NULL,
  mac TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  FOREIGN KEY (sender_email) REFERENCES users(email),
  FOREIGN KEY (receiver_email) REFERENCES users(email)
);

CREATE INDEX IF NOT EXISTS idx_messages_pair_time
ON messages(sender_email, receiver_email, timestamp);
`);

export const userQueries = {
  findByEmail: db.prepare(`
    SELECT email, password_hash, public_key, encrypted_private_key, iv, salt
    FROM users
    WHERE email = ?
  `),

  insert: db.prepare(`
    INSERT INTO users (
      email,
      password_hash,
      public_key,
      encrypted_private_key,
      iv,
      salt
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `),

  findContactsExcept: db.prepare(`
    SELECT email
    FROM users
    WHERE email <> ?
    ORDER BY email ASC
  `),

  findPublicKey: db.prepare(`
    SELECT public_key
    FROM users
    WHERE email = ?
  `)
};

export const messageQueries = {
  insert: db.prepare(`
    INSERT INTO messages (
      sender_email,
      receiver_email,
      ciphertext,
      iv,
      mac,
      timestamp
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `),

  findConversation: db.prepare(`
    SELECT sender_email, ciphertext, iv, mac, timestamp
    FROM messages
    WHERE (
      (sender_email = ? AND receiver_email = ?)
      OR
      (sender_email = ? AND receiver_email = ?)
    )
    AND (? IS NULL OR timestamp > ?)
    ORDER BY timestamp ASC
  `)
};