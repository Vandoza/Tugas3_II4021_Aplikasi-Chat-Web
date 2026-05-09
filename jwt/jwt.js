import crypto from 'crypto';
import { toBase64Url, fromBase64Url } from './utils.js';
 
const ALG_MAP = {
  'ES256': { hash: 'sha256', curve: 'prime256v1', keySize: 32 },
  'ES384': { hash: 'sha384', curve: 'secp384r1',  keySize: 48 },
  'ES512': { hash: 'sha512', curve: 'secp521r1',  keySize: 66 }
};
 
const encodeDerLength = (len) => {
  if (len < 128) return Buffer.from([len]);
  if (len < 256) return Buffer.from([0x81, len]);
  return Buffer.from([0x82, (len >> 8) & 0xff, len & 0xff]);
};
 
const derToJose = (der, keySize) => {
  let offset = 2;
  if (der[1] & 0x80) offset += der[1] & 0x7f;
 
  offset++;
  const rLen = der[offset++];
  let r = der.slice(offset, offset + rLen);
  offset += rLen;
 
  offset++;
  const sLen = der[offset++];
  let s = der.slice(offset, offset + sLen);
 
  while (r.length > keySize) r = r.slice(1);
  while (s.length > keySize) s = s.slice(1);
 
  const result = Buffer.alloc(keySize * 2, 0);
  r.copy(result, keySize - r.length);
  s.copy(result, keySize * 2 - s.length);
 
  return result;
};
 
const joseToDer = (jose, keySize) => {
  let r = jose.slice(0, keySize);
  let s = jose.slice(keySize);
 
  while (r.length > 1 && r[0] === 0) r = r.slice(1);
  while (s.length > 1 && s[0] === 0) s = s.slice(1);
 
  if (r[0] & 0x80) r = Buffer.concat([Buffer.from([0x00]), r]);
  if (s[0] & 0x80) s = Buffer.concat([Buffer.from([0x00]), s]);
 
  const seq = Buffer.concat([
    Buffer.from([0x02, r.length]), r,
    Buffer.from([0x02, s.length]), s,
  ]);
 
  return Buffer.concat([Buffer.from([0x30]), encodeDerLength(seq.length), seq]);
};
 
export const sign = (header, payload, claims, privateKey) => {
  if (!header || typeof header !== 'object') throw new Error("Header tidak valid");
  if (!header.typ || header.typ !== 'JWT') throw new Error("Header harus memiliki typ: \"JWT\"");
  if (!header.alg || !ALG_MAP[header.alg]) throw new Error("Algoritma tidak didukung");
 
  const finalPayload = { ...payload, ...claims };
 
  const encodedHeader  = toBase64Url(header);
  const encodedPayload = toBase64Url(finalPayload);
  const message        = `${encodedHeader}.${encodedPayload}`;
 
  const signer = crypto.createSign(ALG_MAP[header.alg].hash);
  signer.update(message);
  signer.end();
 
  const derSignature  = signer.sign(privateKey);
  const joseSignature = derToJose(derSignature, ALG_MAP[header.alg].keySize);
 
  return `${message}.${toBase64Url(joseSignature)}`;
};
 
export const verify = (token, publicKey, options = {}) => {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error("Format JWT tidak valid");
 
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
 
  let header, payload;
  try {
    header  = JSON.parse(fromBase64Url(encodedHeader).toString());
    payload = JSON.parse(fromBase64Url(encodedPayload).toString());
  } catch {
    throw new Error("Format JWT tidak valid: header atau payload bukan JSON yang valid");
  }
 
  if (options.algs && !options.algs.includes(header.alg)) throw new Error("Algoritma tidak diizinkan");
  if (!ALG_MAP[header.alg]) throw new Error("Algoritma tidak didukung: " + header.alg);
 
  const joseSignature = fromBase64Url(encodedSignature);
  const derSignature  = joseToDer(joseSignature, ALG_MAP[header.alg].keySize);
 
  const verifier = crypto.createVerify(ALG_MAP[header.alg].hash);
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  const isValid = verifier.verify(publicKey, derSignature);
 
  if (!isValid) throw new Error("Signature tidak sesuai");
 
  const now = Math.floor(Date.now() / 1000);
 
  if (!options.ignoreExp && payload.exp !== undefined && now > payload.exp) throw new Error("Token kedaluwarsa (exp)");
  if (!options.ignoreNbf && payload.nbf !== undefined && now < payload.nbf) throw new Error("Token belum aktif (nbf)");
 
  if (options.iss && payload.iss !== options.iss) throw new Error("Issuer tidak cocok");
  if (options.sub && payload.sub !== options.sub) throw new Error("Subject tidak cocok");
  if (options.aud && payload.aud !== options.aud) throw new Error("Audience tidak cocok");
  if (options.jti && payload.jti !== options.jti) throw new Error("JTI tidak cocok");
 
  return { header, payload, signature: encodedSignature };
};