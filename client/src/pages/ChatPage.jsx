import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import DecryptionError from '../components/DecryptionError';

export default function ChatPage() {
  const { email: contactEmail } = useParams();
  const { userEmail } = useSession();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!userEmail) navigate('/login');
  }, [userEmail, navigate]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    console.log('Send:', { to: contactEmail, text: input });
    setInput('');
  }

  return (
    <div>
      <h2>Chat dengan {contactEmail}</h2>
      <div style={{ minHeight: '200px', border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
        {messages.length === 0 ? (
          <p style={{ color: '#aaa' }}>Belum ada pesan.</p>
        ) : (
          messages.map((msg, i) => (
            <div key={i}>
              <strong>{msg.sender_email}:</strong>{' '}
              {msg.decryptFailed ? <DecryptionError /> : msg.plaintext}
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSend}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Tulis pesan..."
          style={{ width: '80%' }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
