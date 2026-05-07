import { importPublicKey } from "./login";

// TODO Modul 5
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

    return aeskey;
}

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

export async function performKeyExchange(myPrivateKey, theirPublicKeyBase64) {
    const theirPublicKey = await importPublicKey(theirPublicKeyBase64);
    const sharedSecret = await deriveSharedSecret(myPrivateKey, theirPublicKey);
    const aesKey = await deriveAESKey(sharedSecret);
    const macKey = await deriveMACKey(sharedSecret);

    return {aesKey: aesKey, macKey: macKey};
}

// Helper
async function toHKDFKey(sharedSecretBuf) {
    return crypto.subtle.importKey(
        "raw",
        sharedSecretBuf,
        "HKDF",
        false,
        ["deriveKey"]
    );
  }