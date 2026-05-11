import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { authRoutes } from './routes/authRoutes.js';
import { userRoutes } from './routes/userRoutes.js';
import { messageRoutes } from './routes/messageRoutes.js';

export const app = express();

app.use(cors({
  origin: config.clientOrigin,
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'tugas3-ii4021-chat-backend'
  });
});

app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', messageRoutes);

app.use((req, res) => {
  return res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({ error: 'Internal server error' });
});