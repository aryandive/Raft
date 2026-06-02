// utils/crypto.ts

const DB_NAME = 'RaftVaultDB';
const STORE_NAME = 'crypto_keys';
const KEY_ID = 'master_aes_key';

/**
 * ==========================================
 * 1. KEY GENERATION & EXPORT (The Setup)
 * ==========================================
 */

// Generates a new key and exports it as a Base64 Recovery String for the user to save.
export async function setupNewMasterKey(): Promise<{ key: CryptoKey, recoveryString: string }> {
  // Generate the native Web Crypto key
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // Must be true so we can export it for the recovery string
    ["encrypt", "decrypt"]
  );

  // Export to JSON Web Key (JWK) format, then stringify and Base64 encode it
  const exported = await window.crypto.subtle.exportKey("jwk", key);
  const recoveryString = btoa(JSON.stringify(exported));

  // Save it silently to the local browser for daily use
  await saveKeyToLocal(key);

  return { key, recoveryString };
}

// Converts the Base64 Recovery String back into a usable CryptoKey (For new devices)
export async function importRecoveryKey(recoveryString: string): Promise<CryptoKey> {
  try {
    const jwk = JSON.parse(atob(recoveryString));
    const key = await window.crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
    
    // Save to local IndexedDB so they don't have to paste it again tomorrow
    await saveKeyToLocal(key);
    return key;
  } catch {
    throw new Error("Invalid Recovery Key. Please check your spelling and formatting.");
  }
}

/**
 * ==========================================
 * 2. INDEXEDDB LOCAL VAULT (Daily Use)
 * ==========================================
 */

// Native IndexedDB Wrapper to save the CryptoKey
function openVaultDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("Failed to open local vault");
  });
}

async function saveKeyToLocal(key: CryptoKey): Promise<void> {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(key, KEY_ID);
    request.onsuccess = () => resolve();
    request.onerror = () => reject("Failed to save key locally");
  });
}

// Retrieves the key when the app loads. If null, the user needs to paste their Recovery String.
export async function getLocalMasterKey(): Promise<CryptoKey | null> {
  const db = await openVaultDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(KEY_ID);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject("Failed to read key from local vault");
  });
}

/**
 * ==========================================
 * 3. ENCRYPTION & DECRYPTION 
 * ==========================================
 */

// Encrypts plaintext to Base64 (Store this in Supabase)
export async function encryptPayload(plaintext: string, key: CryptoKey): Promise<{ ciphertext: string, iv: string }> {
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoder.encode(plaintext)
  );

  return {
    ciphertext: btoa(String.fromCharCode(...Array.from(new Uint8Array(encryptedBuffer)))),
    iv: btoa(String.fromCharCode(...Array.from(iv)))
  };
}

// Decrypts Base64 back to plaintext (Run this in the browser)
export async function decryptPayload(ciphertextBase64: string, ivBase64: string, key: CryptoKey): Promise<string> {
  const iv = new Uint8Array(atob(ivBase64).split('').map(c => c.charCodeAt(0)));
  const ciphertext = new Uint8Array(atob(ciphertextBase64).split('').map(c => c.charCodeAt(0)));

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(decryptedBuffer);
  } catch {
    throw new Error("Decryption failed. The data may be tampered with or the wrong key was used.");
  }
}