import { openDB } from 'idb';

const DB_NAME = 'mimo-music-db';
const DB_VERSION = 1;

const openMiMoDb = () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Favorites store
      if (!db.objectStoreNames.contains('favorites')) {
        db.createObjectStore('favorites', { keyPath: 'id' });
      }

      // Playlists store
      if (!db.objectStoreNames.contains('playlists')) {
        const playlistStore = db.createObjectStore('playlists', { keyPath: '_id' });
        playlistStore.createIndex('updatedAt', 'updatedAt');
      }

      // History store
      if (!db.objectStoreNames.contains('history')) {
        const historyStore = db.createObjectStore('history', { keyPath: 'trackId' });
        historyStore.createIndex('playedAt', 'playedAt');
      }

      // Cache store for API responses
      if (!db.objectStoreNames.contains('apiCache')) {
        const cacheStore = db.createObjectStore('apiCache', { keyPath: 'url' });
        cacheStore.createIndex('timestamp', 'timestamp');
      }
    }
  });
};

// Favorites operations
export const cacheFavorites = async (favorites) => {
  const db = await openMiMoDb();
  const tx = db.transaction('favorites', 'readwrite');
  await Promise.all([
    ...favorites.map(fav => tx.store.put(fav)),
    tx.done
  ]);
};

export const getCachedFavorites = async () => {
  const db = await openMiMoDb();
  return db.getAll('favorites');
};

// Playlist operations
export const cachePlaylists = async (playlists) => {
  const db = await openMiMoDb();
  const tx = db.transaction('playlists', 'readwrite');
  await Promise.all([
    ...playlists.map(playlist => tx.store.put(playlist)),
    tx.done
  ]);
};

export const getCachedPlaylists = async () => {
  const db = await openMiMoDb();
  return db.getAll('playlists');
};

// History operations
export const cacheHistory = async (history) => {
  const db = await openMiMoDb();
  const tx = db.transaction('history', 'readwrite');
  await Promise.all([
    ...history.map(entry => tx.store.put(entry)),
    tx.done
  ]);
};

export const getCachedHistory = async () => {
  const db = await openMiMoDb();
  return db.getAllFromIndex('history', 'playedAt');
};

// API Cache operations
export const cacheApiResponse = async (url, data, ttl = 3600000) => { // 1 hour TTL default
  const db = await openMiMoDb();
  await db.put('apiCache', {
    url,
    data,
    timestamp: Date.now(),
    expires: Date.now() + ttl
  });
};

export const getCachedApiResponse = async (url) => {
  const db = await openMiMoDb();
  const cache = await db.get('apiCache', url);
  
  if (!cache) return null;
  
  if (cache.expires < Date.now()) {
    await db.delete('apiCache', url);
    return null;
  }
  
  return cache.data;
};

// Clear expired cache entries
export const clearExpiredCache = async () => {
  const db = await openMiMoDb();
  const tx = db.transaction('apiCache', 'readwrite');
  const store = tx.store;
  const now = Date.now();

  for await (const cursor of store.index('timestamp')) {
    if (cursor.value.expires < now) {
      await cursor.delete();
    }
  }
};