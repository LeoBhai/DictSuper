import { openDB } from 'idb';

export const initDB = async () => {
  return await openDB('dictionary', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('words')) {
        db.createObjectStore('words');
      }
    },
  });
};
