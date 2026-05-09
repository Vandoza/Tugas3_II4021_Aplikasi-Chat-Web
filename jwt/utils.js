export const toBase64Url = (data) => {
  const base64 = Buffer.isBuffer(data)
    ? data.toString('base64')
    : Buffer.from(typeof data === 'object' ? JSON.stringify(data) : data).toString('base64');
 
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};
 
export const fromBase64Url = (base64url) => {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64');
};