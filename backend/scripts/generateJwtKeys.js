import crypto from 'crypto';

const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  },
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  }
});

console.log('JWT_PRIVATE_KEY_B64=' + Buffer.from(privateKey).toString('base64'));
console.log('JWT_PUBLIC_KEY_B64=' + Buffer.from(publicKey).toString('base64'));