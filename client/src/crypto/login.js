import { arrayBufferToBase64, uint8ArrayToBase64, base64ToArrayBuffer, base64ToUint8Array } from './utils.js';
import { deriveKeyFromPassword } from './registration.js';

// Import public key dari server
export async function importPublicKey(publicKeyBase64) {
    const publicKey = await crypto.subtle.importKey(
        "spki",
        base64ToArrayBuffer(publicKeyBase64),
        {name: "ECDH", namedCurve: "P-256"},
        false,
        []
    );

    return publicKey;
}

// Recover private key menggunakan password
export async function recoverPrivateKey(password, encryptedPrivateKey, iv, salt) {
    const passKey = await deriveKeyFromPassword(password, base64ToUint8Array(salt));

    const privateKeyBuf = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: base64ToUint8Array(iv)
        },
        passKey,
        base64ToArrayBuffer(encryptedPrivateKey)
    );

    const privateKey = await crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuf,
        {name: "ECDH", namedCurve: "P-256"},
        true,
        ["deriveBits", "deriveKey"]
    );

    return privateKey;
}
