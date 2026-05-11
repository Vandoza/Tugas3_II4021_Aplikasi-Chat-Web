import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { getContacts } from '../api/contacts';
import { logoutUser } from '../api/auth';

export default function ContactListPage() {
  const { userEmail, clearSession } = useSession();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function handleLogout() {
    await logoutUser();
    clearSession();
    navigate('/login');
  }

  useEffect(() => {
    if (!userEmail) { navigate('/login'); return; }
    getContacts()
      .then(data => { setContacts(data); setLoading(false); })
      .catch(err => { alert(err.message); setLoading(false); });
  }, [userEmail, navigate]);

  return (
    <div>
      <div style={{ position: 'fixed', top: '3px', left: '12px' }}>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <h2>Kontak</h2>
      {loading ? (
        <p>Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <p>Belum ada user lain yang terdaftar.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {contacts.map(c => (
            <li
              key={c.email}
              onClick={() => navigate(`/chat/${c.email}`)}
              style={{
                cursor: 'pointer',
                padding: '12px 16px',
                borderBottom: '1px solid #496593',
                borderRadius: '4px',
                marginBottom: '4px',
                backgroundColor: '#142459',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#496593'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#142459'}
            >
              {c.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
