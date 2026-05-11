export async function getContacts() {
    const res = await fetch('/api/contacts', {
        credentials: 'include'
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getPublicKey(email) {
    const res = await fetch(`/api/users/${encodeURIComponent(email)}/publicKey`, {
        credentials: 'include'
    });
    if (!res.ok) throw new Error(await res.text());
    return res.text();
}
