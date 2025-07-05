import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'GeoguessrChallengeTracker';
const DB_VERSION = 1;
export const CHALLENGES_STORE = 'challenges';
export const METADATA_STORE = 'metadata';
export const CHALLENGES_LIST_KEY = 'challenges_list';
export const DASHBOARDS_LIST_KEY = 'dashboards_list';
export const CURRENT_DASHBOARD_KEY = 'current_dashboard';
export const DEFAULT_DASHBOARD_ID = 'default_dashboard';

let dbPromise: Promise<IDBPDatabase>;

export const initDB = (): Promise<IDBPDatabase> => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create challenges store
        if (!db.objectStoreNames.contains(CHALLENGES_STORE)) {
          const challengesStore = db.createObjectStore(CHALLENGES_STORE, {
            keyPath: 'id'
          });
          challengesStore.createIndex('cachedAt', 'cachedAt');
        }
        
        // Create metadata store for storing lists and other metadata
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE);
        }
      },
    });
  }
  return dbPromise;
};

export const withTransaction = async <T>(
  storeNames: string | string[],
  mode: 'readonly' | 'readwrite',
  callback: (tx: any) => Promise<T> | T
): Promise<T> => {
  const db = await initDB();
  const tx = db.transaction(storeNames, mode);
  try {
    const result = await Promise.resolve(callback(tx));
    await tx.done;
    return result;
  } catch (error) {
    console.error('Transaction failed:', error);
    // Abort the transaction on error
    if (tx.done && !tx.done.then(res => true, rej => false)) {
        tx.abort();
    }
    throw error;
  }
}; 