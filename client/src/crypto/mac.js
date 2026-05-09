import { arrayBufferToBase64, base64ToUint8Array } from "./utils";

// Menghitung nilai MAC
export async function computeMAC(ciphertext, iv, macKey) {
    const data = concatBytes(base64ToUint8Array(ciphertext), base64ToUint8Array(iv));
    const macBuf = await crypto.subtle.sign("HMAC", macKey, data);

    return arrayBufferToBase64(macBuf);
}

// Verify MAC
export async function verifyMAC(ciphertext, iv, mac, macKey) {
    const data = concatBytes(base64ToUint8Array(ciphertext), base64ToUint8Array(iv));
    const macBytes = base64ToUint8Array(mac);

    return crypto.subtle.verify("HMAC", macKey, macBytes, data);
}

// Helper
  function concatBytes(a, b) {                                                                                                                                             
      const result = new Uint8Array(a.length + b.length);                                                                                                                  
      result.set(a, 0);                                                                                                                                                    
      result.set(b, a.length);
      return result;
  }