import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../api/auth';
import { useSession } from '../context/SessionContext';
import { recoverPrivateKey } from '../crypto/login';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setSession } = useSession();

  async function handleSubmit(e) {
    e.preventDefault();
    console.log('Login:', { email, password });  
    try{
      const { publicKey, encryptedPrivateKey, iv, salt} = await loginUser({email, password});
      const privateKey = await recoverPrivateKey(password, encryptedPrivateKey, iv, salt);
      setSession({ email, key:privateKey})
      navigate('/contacts');
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <h2>Login</h2>
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
        <button type="submit">Login</button>
      </form>
      <p>Belum punya akun? <Link to="/register">Register</Link></p>
    </div>
  );
}
