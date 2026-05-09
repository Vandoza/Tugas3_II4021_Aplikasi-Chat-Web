import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { getContacts } from '../api/contacts';

export default function ContactListPage() {
  const { userEmail } = useSession();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    if (!userEmail) { navigate('/login'); return; }
    getContacts()
      .then(setContacts)
      .catch(err => alert(err.message));
  }, [userEmail, navigate]);

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
