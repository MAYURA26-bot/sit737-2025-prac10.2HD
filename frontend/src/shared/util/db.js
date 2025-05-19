import { openDB } from 'idb';

const DB_NAME = 'FitnessTrackerDb';
const STORE_NAME = 'workouts';
const DB_VERSION = 1;

export async function getDB() {
  return await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function addActivity(activity) {
  const db = await getDB();
  return await db.add(STORE_NAME, activity);
}

export async function getAllActivities() {
  const db = await getDB();
  return await db.getAll(STORE_NAME);
}
