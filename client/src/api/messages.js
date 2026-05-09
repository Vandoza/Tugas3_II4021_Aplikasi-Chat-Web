export async function sendMessage({ senderEmail, receiverEmail, ciphertext, iv, mac, timestamp }) {
    const res = await fetch('/api/messages', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_email: senderEmail, receiver_email: receiverEmail, ciphertext, iv, mac, timestamp })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function getMessages(contactEmail, since) {
    const url = since
        ? `/api/messages/${encodeURIComponent(contactEmail)}?since=${encodeURIComponent(since)}`
        : `/api/messages/${encodeURIComponent(contactEmail)}`;
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
