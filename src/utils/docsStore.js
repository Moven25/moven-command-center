// src/utils/docsStore.js
/* IndexedDB-backed document storage for LaneSync
   - Stores uploaded files as Blobs
   - Keyed by loadId
   - Supports list/upload/download/delete
*/

const DB_NAME = "lanesync-docs";
const DB_VERSION = 1;
const STORE = "docs";

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `doc_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("byLoadId", "loadId", { unique: false });
        store.createIndex("byLoadIdType", ["loadId", "type"], { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export async function listDocsForLoad(loadId) {
  if (!loadId) return [];
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  const idx = store.index("byLoadId");
  const req = idx.getAll(loadId);

  const rows = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });

  await txDone(tx);
  db.close();

  // newest first
  return rows.sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
}

export async function saveDocForLoad(loadId, type, file) {
  if (!loadId) throw new Error("loadId required");
  if (!file) throw new Error("file required");

  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);

  const row = {
    id: uuid(),
    loadId,
    type: String(type || "Other"),
    name: file.name,
    mime: file.type || "application/octet-stream",
    size: file.size || 0,
    uploadedAt: Date.now(),
    blob: file, // Blob/File is storable
  };

  store.put(row);

  await txDone(tx);
  db.close();

  return row;
}

export async function deleteDoc(docId) {
  if (!docId) return;
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(docId);
  await txDone(tx);
  db.close();
}

export async function getDoc(docId) {
  if (!docId) return null;
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const req = tx.objectStore(STORE).get(docId);

  const row = await new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });

  await txDone(tx);
  db.close();
  return row;
}
