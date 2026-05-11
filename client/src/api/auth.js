export async function registerUser({ email, password, publicKey, encryptedPrivateKey, iv, salt }) {
    const res = await fetch('/api/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, publicKey, encryptedPrivateKey, iv, salt })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function loginUser({ email, password }) {
    const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function logoutUser() {
    const res = await fetch('/api/logout', {
        method: 'POST',
        credentials:'include'
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}