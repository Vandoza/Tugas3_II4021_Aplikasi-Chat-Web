import { arrayBufferToBase64, uint8ArrayToBase64, base64ToArrayBuffer, base64ToUint8Array } from './utils.js';

// Generate ECDH P-256 keypair untuk user baru
export async function generateECDHKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        true,
        ["deriveBits", "deriveKey"]
    );

    return { publicKey: keyPair.publicKey, privateKey: keyPair.privateKey };
}

// Derive key dari passwrod untuk encrypt private key
export async function deriveKeyFromPassword(password, salt) { // Private key salt
    const passwordKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            hash: "SHA-256",
            salt,
            iterations: 100000
        },
        passwordKey,
        {
            name: "AES-GCM",
            length: 256
        },
        false,
        ["encrypt", "decrypt"]
    );

    return derivedKey;
}

// Enkripsi private key menggunakan password-derived key
export async function encryptPrivateKey(privateKey, encryptionKey) {
    const pkcs = await crypto.subtle.exportKey(
        "pkcs8",
        privateKey
    );

    const iv = crypto.getRandomValues(new Uint8Array(12)); // Private key iv
    const cipherPrivateKeyBuf = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv
        },
        encryptionKey,
        pkcs
    );

    const cipherPrivateKey = arrayBufferToBase64(cipherPrivateKeyBuf);
    const ivString = uint8ArrayToBase64(iv)

    return {encryptedPrivateKey: cipherPrivateKey, iv: ivString};
}

// Export public key ke format base64 SPKI untuk dikirim ke server
export async function exportPublicKey(publicKey) {
    const spki = await crypto.subtle.exportKey(
        "spki",
        publicKey
    )
    const pubkey = arrayBufferToBase64(spki);

    return pubkey;
}