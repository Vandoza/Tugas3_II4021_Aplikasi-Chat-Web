import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';

export default function ContactListPage() {
  const { userEmail } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userEmail) navigate('/login');
  }, [userEmail, navigate]);

  const contacts = []; // TODO Modul 8: fetch dari API

  return (
    <div>
      <h2>Kontak</h2>
      {contacts.length === 0 ? (
        <p>Loading contacts...</p>
      ) : (
        <ul>
          {contacts.map(c => (
            <li key={c.email} onClick={() => navigate(`/chat/${c.email}`)} style={{ cursor: 'pointer' }}>
              {c.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
