import { arrayBufferToBase64, uint8ArrayToBase64 } from "./utils"

// Enkripsi pesan
export async function encryptMessage(plaintext, aesKey) {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const ciphertext = await crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        aesKey,
        new TextEncoder().encode(plaintext)
    );

    return {ciphertext: arrayBufferToBase64(ciphertext), iv: uint8ArrayToBase64(iv)};
}

// Dekripsi pesan
export async function decryptMessage(ciphertext, iv, aesKey) {
    const plaintext = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        aesKey,
        ciphertext
    );

    return new TextDecoder().decode(plaintext);
}

// Wrapper dekripsi
export async function safeDecryptMessage(ciphertext, iv, aesKey) {
    try {
        const plaintext = await decryptMessage(ciphertext, iv, aesKey);
        return { success: true, plaintext };
    } catch (e) {
        return { success: false, error: e.message };
    }
}
