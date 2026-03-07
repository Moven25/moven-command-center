// src/utils/docsStore.js
// Simple IndexedDB doc store for LoadDocsPanel.jsx
// Stores docs locally per-browser (not synced across devices).

const DB_NAME = "lanesync_docs_db";
const DB_VERSION = 1;
const STORE = "docs";

// -----------------------------
// Internal helpers
// -----------------------------
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("by_load", "loadId", { unique: false });
        store.createIndex("by_load_type", ["loadId", "type"], { unique: false });
        store.createIndex("by_uploaded", "uploadedAt", { unique: false });
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

function uid() {
  // good enough id for local docs
  return (crypto?.randomUUID?.() || `doc_${Date.now()}_${Math.random().toString(16).slice(2)}`);
}

function toRowPreview(row) {
  if (!row) return null;
  return {
    id: row.id,
    loadId: row.loadId,
    type: row.type,
    name: row.name,
    size: row.size,
    mime: row.mime,
    uploadedAt: row.uploadedAt,
  };
}

// -----------------------------
// Public API (used by LoadDocsPanel)
// -----------------------------

/**
 * List docs for a loadId (metadata only; no blob)
 */
export async function listDocsForLoad(loadId) {
  if (!loadId) return [];

  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);
  const idx = store.index("by_load");

  const rows = await new Promise((resolve, reject) => {
    const out = [];
    const req = idx.openCursor(IDBKeyRange.only(loadId));

    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return resolve(out);

      const row = cursor.value;
      out.push(toRowPreview(row));
      cursor.continue();
    };

    req.onerror = () => reject(req.error);
  });

  await txDone(tx);
  db.close();

  // newest first
  rows.sort((a, b) => (b.uploadedAt || 0) - (a.uploadedAt || 0));
  return rows;
}

/**
 * Save a doc blob for a load and type.
 * Accepts a File object from <input type="file">
 */
export async function saveDocForLoad(loadId, type, file) {
  if (!loadId) throw new Error("Missing loadId");
  if (!file) throw new Error("Missing file");

  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);

  const row = {
    id: uid(),
    loadId,
    type: type || "Other",
    name: file.name || "document",
    size: file.size || 0,
    mime: file.type || "application/octet-stream",
    uploadedAt: Date.now(),
    blob: file, // File is a Blob — IndexedDB can store it
  };

  await new Promise((resolve, reject) => {
    const req = store.put(row);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  await txDone(tx);
  db.close();

  return toRowPreview(row);
}

/**
 * Get a doc including blob (used for download)
 */
export async function getDoc(docId) {
  if (!docId) return null;

  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  const store = tx.objectStore(STORE);

  const row = await new Promise((resolve, reject) => {
    const req = store.get(docId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });

  await txDone(tx);
  db.close();

  // NOTE: LoadDocsPanel expects row.blob to exist
  return row;
}

/**
 * Delete a doc by id
 */
export async function deleteDoc(docId) {
  if (!docId) return;

  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);

  await new Promise((resolve, reject) => {
    const req = store.delete(docId);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });

  await txDone(tx);
  db.close();
}