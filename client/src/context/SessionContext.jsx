import { createContext, useContext, useState } from 'react';

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [userEmail, setUserEmail] = useState(null);
  const [privateKey, setPrivateKey] = useState(null);
  const [aesKeys, setAesKeys] = useState({});

  function setSession({ email, key }) {
    setUserEmail(email);
    setPrivateKey(key);
  }

  function clearSession() {
    setUserEmail(null);
    setPrivateKey(null);
    setAesKeys({});
  }

  function cacheAesKeys(contactEmail, keys) {
    setAesKeys(prev => ({ ...prev, [contactEmail]: keys }));
  }

  return (
    <SessionContext.Provider value={{ userEmail, privateKey, aesKeys, setSession, clearSession, cacheAesKeys }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
