import crypto from 'crypto';
import { sign, verify } from './jwt.js';

const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const { publicKey: wrongPublicKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

describe('Library JWT', () => {

  const baseHeader = { alg: 'ES256', typ: 'JWT' };
  const basePayload = { username: 'alice', role: 'user' };

  describe('Happy Path', () => {
    it('1. Harus bisa sign dan verify token yang valid', () => {
      const claims = { iss: 'itb-chat', exp: Math.floor(Date.now() / 1000) + 3600 };
      
      const token = sign(baseHeader, basePayload, claims, privateKey);
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);

      const decoded = verify(token, publicKey, { algs: ['ES256'], iss: 'itb-chat' });
      
      expect(decoded.payload.username).toBe('alice');
      expect(decoded.payload.iss).toBe('itb-chat');
    });
  });

  describe('Edge Case : Sign Function', () => {
    it('2. Harus gagal jika menggunakan algoritma yang tidak didukung', () => {
      const invalidHeader = { alg: 'HS256', typ: 'JWT' };
      expect(() => sign(invalidHeader, basePayload, {}, privateKey))
        .toThrow('Algoritma tidak didukung');
    });

    it('3. Harus gagal jika header tidak memiliki typ: JWT', () => {
      const invalidHeader = { alg: 'ES256' };
      expect(() => sign(invalidHeader, basePayload, {}, privateKey))
        .toThrow('Header harus memiliki typ: "JWT"');
    });

    it('4. Harus gagal jika header tidak memiliki properti alg', () => {
      const invalidHeader = { typ: 'JWT' };
      expect(() => sign(invalidHeader, basePayload, {}, privateKey))
        .toThrow('Algoritma tidak didukung');
    });

    it('5. Harus gagal jika parameter header null atau bukan object', () => {
      expect(() => sign(null, basePayload, {}, privateKey))
        .toThrow('Header tidak valid');
    });

    it('6. Harus gagal jika menggunakan Private Key yang tidak valid atau rusak', () => {
      const invalidPrivateKey = "ini-jelas-bukan-kunci-pem-yang-valid";
      expect(() => sign(baseHeader, basePayload, {}, invalidPrivateKey))
        .toThrow();
    });
  });

  describe('Edge Case : Verify Function', () => {
    it('7. Harus gagal jika format JWT tidak memiliki 3 bagian (titik kurang)', () => {
      const invalidToken = "eyJhbGciOiJFUzI1NiJ9.eyJmb28iOiJiYXIifQ";
      expect(() => verify(invalidToken, publicKey))
        .toThrow('Format JWT tidak valid');
    });

    it('8. Harus gagal (Invalid Signature) jika diverifikasi dengan Public Key yang berbeda', () => {
      const token = sign(baseHeader, basePayload, {}, privateKey);
      expect(() => verify(token, wrongPublicKey))
        .toThrow('Signature tidak sesuai');
    });

    it('9. Harus gagal (Invalid Signature) jika isi payload diubah/dimanipulasi (Tampering)', () => {
      const token = sign(baseHeader, basePayload, {}, privateKey);
      
      const hackerPayload = { ...basePayload, role: 'admin' };
      
      const encodedHackerPayload = Buffer.from(JSON.stringify(hackerPayload))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      const parts = token.split('.');
      parts[1] = encodedHackerPayload;
      const tamperedToken = parts.join('.');

      expect(() => verify(tamperedToken, publicKey))
        .toThrow('Signature tidak sesuai');
    });

    it('10. Harus gagal jika token sudah melewati batas waktu (Expired)', () => {
      const claims = { exp: Math.floor(Date.now() / 1000) - 10 };
      const token = sign(baseHeader, basePayload, claims, privateKey);
      
      expect(() => verify(token, publicKey))
        .toThrow('Token kedaluwarsa (exp)');
    });

    it('11. Harus gagal jika Issuer (iss) tidak cocok dengan options', () => {
      const claims = { iss: 'hacker-server' };
      const token = sign(baseHeader, basePayload, claims, privateKey);
      
      expect(() => verify(token, publicKey, { iss: 'itb-chat' }))
        .toThrow('Issuer tidak cocok');
    });
  });
});