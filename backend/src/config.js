import dotenv from 'dotenv';

dotenv.config();

const required = (name) => {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Environment variable ${name} belum diisi`);
  }
  return value;
};

const decodePem = (base64Value) => {
  return Buffer.from(base64Value, 'base64').toString('utf8');
};

export const config = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  databasePath: process.env.DATABASE_PATH || './data/chat.db',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || 12),
  jwtAlg: process.env.JWT_ALG || 'ES256',
  jwtExpiresInSeconds: Number(process.env.JWT_EXPIRES_IN_SECONDS || 86400),
  jwtIssuer: process.env.JWT_ISSUER || 'tugas3-ii4021-chat',
  jwtAudience: process.env.JWT_AUDIENCE || 'tugas3-ii4021-client',
  jwtCookieName: process.env.JWT_COOKIE_NAME || 'jwt',
  jwtPrivateKey: decodePem(required('JWT_PRIVATE_KEY_B64')),
  jwtPublicKey: decodePem(required('JWT_PUBLIC_KEY_B64')),
  isProduction: process.env.NODE_ENV === 'production'
};