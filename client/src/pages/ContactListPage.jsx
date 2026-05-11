import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { getContacts } from '../api/contacts';
import { logoutUser } from '../api/auth';

export default function ContactListPage() {
  const { userEmail, clearSession } = useSession();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);

  async function handleLogout() {
    await logoutUser();
    clearSession();
    navigate('/login');
  }

  useEffect(() => {
    if (!userEmail) { navigate('/login'); return; }
    getContacts()
      .then(setContacts)
      .catch(err => alert(err.message));
  }, [userEmail, navigate]);

  return (
    <div>
      <div style={{ position: 'fixed', top: '3px', left: '12px' }}>
        <button onClick={handleLogout}>Logout</button>
      </div>
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
