import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import DecryptionError from '../components/DecryptionError';
import { performKeyExchange } from '../crypto/keyExchange';
import { encryptMessage, safeDecryptMessage } from '../crypto/messaging';
import { computeMAC, verifyMAC } from '../crypto/mac';
import { getPublicKey } from '../api/contacts';
import { sendMessage, getMessages } from '../api/messages';

export default function ChatPage() {
  const { email: contactEmail } = useParams();
  const { userEmail, privateKey, aesKeys, cacheAesKeys } = useSession();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const lastTimestamp = useRef(null);

  // Guard + key exchange saat buka chat
  useEffect(() => {
    if (!userEmail) { navigate('/login'); return; }

    async function init() {
      try {
        if (!aesKeys[contactEmail]) {
          const theirPublicKeyB64 = await getPublicKey(contactEmail);
          const keys = await performKeyExchange(privateKey, theirPublicKeyB64);
          cacheAesKeys(contactEmail, keys);
        }
      } catch (err) {
        alert(err.message);
      }
    }
    init();
  }, [contactEmail, userEmail, navigate]);

  // Polling setiap 3 detik
  useEffect(() => {
    if (!aesKeys[contactEmail]) return;
    const { aesKey, macKey } = aesKeys[contactEmail];

    const interval = setInterval(async () => {
      try {
        const newMessages = await getMessages(contactEmail, lastTimestamp.current);
        if (newMessages.length === 0) return;

        const decrypted = await Promise.all(newMessages.map(async (msg) => {
          const macValid = await verifyMAC(msg.ciphertext, msg.iv, msg.mac, macKey);
          if (!macValid) return { ...msg, decryptFailed: true };
          const result = await safeDecryptMessage(msg.ciphertext, msg.iv, aesKey);
          return result.success
            ? { ...msg, plaintext: result.plaintext }
            : { ...msg, decryptFailed: true };
        }));

        setMessages(prev => [...prev, ...decrypted]);
        lastTimestamp.current = newMessages[newMessages.length - 1].timestamp;
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [contactEmail, aesKeys]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !aesKeys[contactEmail]) return;
    const { aesKey, macKey } = aesKeys[contactEmail];

    try {
      const { ciphertext, iv } = await encryptMessage(input, aesKey);
      const mac = await computeMAC(ciphertext, iv, macKey);
      const timestamp = new Date().toISOString();
      await sendMessage({ senderEmail: userEmail, receiverEmail: contactEmail, ciphertext, iv, mac, timestamp });
      setMessages(prev => [...prev, { sender_email: userEmail, plaintext: input, timestamp }]);
      setInput('');
    } catch (err) {
      alert(err.message);
    }
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
