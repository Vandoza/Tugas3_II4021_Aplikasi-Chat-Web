import { verify } from './jwt.js';
 
export const authMiddleware = (publicKey) => (req, res, next) => {
  const token = req.cookies.jwt;
 
  if (!token) return res.status(401).json({ error: "Autentikasi diperlukan" });
 
  try {
    const decoded = verify(token, publicKey, { algs: ['ES256'] });
    req.user = decoded.payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }
};