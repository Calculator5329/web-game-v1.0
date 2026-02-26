import type { SaveData } from '../core/types';

const DB_NAME = 'nexus_chronicles';
const DB_VERSION = 1;
const STORE_NAME = 'saves';
const LS_KEY = 'nexus_chronicles_save';
const SAVE_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'slot' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveGame(data: SaveData, slot: string = 'auto'): Promise<void> {
  const payload = { ...data, version: SAVE_VERSION, timestamp: Date.now() };

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ slot, data: payload });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    localStorage.setItem(`${LS_KEY}_${slot}`, JSON.stringify(payload));
  }
}

export async function loadGame(slot: string = 'auto'): Promise<SaveData | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(slot);
    const result = await new Promise<SaveData | null>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.data ?? null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return result;
  } catch {
    const raw = localStorage.getItem(`${LS_KEY}_${slot}`);
    if (raw) {
      try { return JSON.parse(raw) as SaveData; }
      catch { return null; }
    }
    return null;
  }
}

export async function deleteSave(slot: string = 'auto'): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(slot);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    localStorage.removeItem(`${LS_KEY}_${slot}`);
  }
}

export async function hasSave(slot: string = 'auto'): Promise<boolean> {
  const data = await loadGame(slot);
  return data !== null;
}

export async function listSaves(): Promise<{ slot: string; timestamp: number }[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    const results = await new Promise<Array<{ slot: string; data: SaveData }>>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result ?? []);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return results.map(r => ({ slot: r.slot, timestamp: r.data.timestamp }));
  } catch {
    return [];
  }
}
