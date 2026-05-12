import { arrayBufferToBase64, uint8ArrayToBase64, base64ToArrayBuffer, base64ToUint8Array } from "./utils"

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

    console.log("Encrypting message: ", plaintext);

    return {ciphertext: arrayBufferToBase64(ciphertext), iv: uint8ArrayToBase64(iv)};
}

// Dekripsi pesan
export async function decryptMessage(ciphertext, iv, aesKey) {
    const plaintext = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: base64ToUint8Array(iv)
        },
        aesKey,
        base64ToArrayBuffer(ciphertext)
    );

    return new TextDecoder().decode(plaintext);
}

// Wrapper dekripsi
export async function safeDecryptMessage(ciphertext, iv, aesKey) {
    try {
        const plaintext = await decryptMessage(ciphertext, iv, aesKey);
        console.log("Message decrypted: ", plaintext);
        return { success: true, plaintext };
    } catch (e) {
        console.log("Failed to decrypt message");
        return { success: false, error: e.message };
    }
}
