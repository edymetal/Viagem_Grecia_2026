import { openDB, type DBSchema } from 'idb';
import { stateSchema, documentMetaSchema, type AppState, type LocalDocument } from '../data/schema';
import { initialState } from '../data/initial';
import { correctItinerary } from './itinerary';

interface TravelDB extends DBSchema {
  state: { key: string; value: AppState };
  documents: { key: string; value: LocalDocument };
}
// Observe completion immediately: an individual request and tx.done may both reject.
// Await the abort before exposing an error so failed restores never appear partial.
async function commitTransaction(
  tx: { done: Promise<void>; abort(): void },
  work: () => Promise<void>,
) {
  const completion = tx.done;
  void completion.catch(() => undefined);
  try {
    await work();
    await completion;
  } catch (error) {
    try {
      tx.abort();
    } catch {
      /* The browser may have already aborted it. */
    }
    await completion.catch(() => undefined);
    throw error;
  }
}
export const db = () =>
  openDB<TravelDB>('atenas-2026', 1, {
    upgrade(database) {
      database.createObjectStore('state');
      database.createObjectStore('documents', { keyPath: 'id' });
    },
  });
export async function loadState() {
  const database = await db();
  try {
    const saved = await database.get('state', 'current');
    if (!saved) return initialState();
    const current = stateSchema.parse(saved);
    const corrected = correctItinerary(current);
    if (corrected !== current) await database.put('state', corrected, 'current');
    return corrected;
  } finally {
    database.close();
  }
}
export async function saveState(state: AppState) {
  const valid = stateSchema.parse(state);
  const database = await db();
  try {
    await database.put('state', valid, 'current');
  } finally {
    database.close();
  }
}
export async function listDocuments() {
  const database = await db();
  try {
    return await database.getAll('documents');
  } finally {
    database.close();
  }
}
export async function addDocument(doc: LocalDocument) {
  documentMetaSchema.parse(doc);
  const database = await db();
  try {
    const tx = database.transaction('documents', 'readwrite');
    await commitTransaction(tx, async () => {
      const existing = await tx.store.getAll();
      if (
        existing.length >= 100 ||
        existing.reduce((n, d) => n + d.size, 0) + doc.size > 50 * 1024 * 1024
      ) {
        throw new Error(
          'O limite local é 100 documentos ou 50 MB. Exporte e remova arquivos antes de adicionar outros.',
        );
      }
      await tx.store.add(doc);
    });
  } finally {
    database.close();
  }
}
export async function deleteDocument(id: string) {
  const database = await db();
  try {
    const tx = database.transaction(['state', 'documents'], 'readwrite');
    await commitTransaction(tx, async () => {
      const state = await tx.objectStore('state').get('current');
      if (state) {
        state.activities.forEach((a) => {
          if (a.photoDocumentId === id) a.photoDocumentId = null;
        });
        state.reservations.forEach((r) => {
          if (r.documentId === id) r.documentId = null;
        });
        await tx.objectStore('state').put(state, 'current');
      }
      await tx.objectStore('documents').delete(id);
    });
  } finally {
    database.close();
  }
}
// Restoration replaces data and, only when included, documents in one transaction.
export async function restoreState(state: AppState, documents?: LocalDocument[]) {
  stateSchema.parse(state);
  const database = await db();
  try {
    const tx = database.transaction(['state', 'documents'], 'readwrite');
    await commitTransaction(tx, async () => {
      if (documents !== undefined) {
        await tx.objectStore('documents').clear();
        for (const doc of documents) await tx.objectStore('documents').add(doc);
      }
      await tx.objectStore('state').put(state, 'current');
    });
  } finally {
    database.close();
  }
}
