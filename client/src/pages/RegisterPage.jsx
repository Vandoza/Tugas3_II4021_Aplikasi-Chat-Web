import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { generateECDHKeyPair, deriveKeyFromPassword, encryptPrivateKey, exportPublicKey } from '../crypto/registration';
import { uint8ArrayToBase64 } from '../crypto/utils';
import { registerUser } from '../api/auth';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    console.log('Register:', { email, password }); // Debug log
    try{
      const {publicKey, privateKey} = await generateECDHKeyPair();
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const privatekeyKey = await deriveKeyFromPassword(password, salt);
      const {encryptedPrivateKey, iv} = await encryptPrivateKey(privateKey, privatekeyKey);
      const pubKeyBase64 = await exportPublicKey(publicKey);
      await registerUser({email, password, publicKey: pubKeyBase64, encryptedPrivateKey, iv, salt: uint8ArrayToBase64(salt)});
      navigate('/login');
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      <p>Sudah punya akun? <Link to="/login">Login</Link></p>
    </div>
  );
}
