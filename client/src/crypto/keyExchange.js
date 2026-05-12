import { importPublicKey } from "./login";

// Derive ECDH Shared Secret
export async function deriveSharedSecret(myPrivateKey, theirPublicKey) {
    const sharedSecretBuf = await crypto.subtle.deriveBits(
        {
            name: "ECDH",
            public: theirPublicKey
        },
        myPrivateKey,
        256
    );

    return sharedSecretBuf; 
}

// Derive AES Key Enkripsi/Dekripsi dari ECDH Shared Secret
export async function deriveAESKey(sharedSecret) {
    const hkdfKey = await toHKDFKey(sharedSecret);
    const aeskey = await crypto.subtle.deriveKey(
        {
            name: "HKDF",
            hash: "SHA-256",
            salt: new Uint8Array(32),
            info: new TextEncoder().encode("chat-encryption")
        },
        hkdfKey,
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );

    const rawAesKey = await crypto.subtle.exportKey("raw", aeskey);
    const derivedAesKey = btoa(String.fromCharCode(...new Uint8Array(rawAesKey)));
    console.log('[KeyExchange] Derived AES Key:', derivedAesKey);

    return aeskey;
}

// Derive MAC Key dari Shared Secret
export async function deriveMACKey(sharedSecret) {
    const hkdfKey = await toHKDFKey(sharedSecret);
    const mackey = await crypto.subtle.deriveKey(
        {
            name: "HKDF",
            hash: "SHA-256",
            salt: new Uint8Array(32),
            info: new TextEncoder().encode("chat-mac")
        },
        hkdfKey,
        {
            name: "HMAC",
            hash: "SHA-256",
            length: 256 
        },
        false,
        ["sign", "verify"]
    );

    return mackey;
}

// Lakukan Key Exchange
export async function performKeyExchange(myPrivateKey, theirPublicKeyBase64) {
    const theirPublicKey = await importPublicKey(theirPublicKeyBase64);
    const sharedSecret = await deriveSharedSecret(myPrivateKey, theirPublicKey);

    const sharedSecretB64 = btoa(String.fromCharCode(...new Uint8Array(sharedSecret)));
    console.log('[KeyExchange] Shared Secret (base64):', sharedSecretB64);

    const aesKey = await deriveAESKey(sharedSecret);
    const macKey = await deriveMACKey(sharedSecret);

    return {aesKey: aesKey, macKey: macKey};
}

// Helper
function toHKDFKey(sharedSecretBuf) {
    return crypto.subtle.importKey(
        "raw",
        sharedSecretBuf,
        "HKDF",
        false,
        ["deriveKey"]
    );
  }