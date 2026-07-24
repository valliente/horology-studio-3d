import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface WatchProfile {
  id?: number;
  brand: string;
  model: string;
  caliber: string;
  serialNumber: string;
  liftAngleDeg: number;
  targetVph: number;
}

export interface EnterpriseSession {
  id?: number;
  timestamp: string;
  brand: string;
  model: string;
  caliber: string;
  serialNumber: string;
  tag: string;
  liftAngleDeg: number;
  vph: number;
  rateSd: number;
  beatErrorMs: number;
  amplitudeDeg: number;
  positionalMetrics?: Record<string, { rateSd: number; amplitudeDeg: number; beatErrorMs: number }>;
  wavBlob?: Blob; // Recorded WAV audio telemetry clip
  notes: string;
}

interface EnterpriseDB extends DBSchema {
  sessions: {
    key: number;
    value: EnterpriseSession;
    indexes: { 'by-brand': string; 'by-timestamp': string; 'by-tag': string };
  };
  profiles: {
    key: number;
    value: WatchProfile;
    indexes: { 'by-brand': string };
  };
}

const DB_NAME = 'MicroTimegrapherEnterpriseDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<EnterpriseDB>> | null = null;

export function getEnterpriseDB() {
  if (!dbPromise) {
    dbPromise = openDB<EnterpriseDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const sessionStore = db.createObjectStore('sessions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        sessionStore.createIndex('by-brand', 'brand');
        sessionStore.createIndex('by-timestamp', 'timestamp');
        sessionStore.createIndex('by-tag', 'tag');

        const profileStore = db.createObjectStore('profiles', {
          keyPath: 'id',
          autoIncrement: true,
        });
        profileStore.createIndex('by-brand', 'brand');

        // Initial profiles
        profileStore.add({
          brand: 'Rolex',
          model: 'Submariner Date',
          caliber: 'Cal. 3135',
          serialNumber: 'R849201',
          liftAngleDeg: 52,
          targetVph: 28800,
        });
        profileStore.add({
          brand: 'Omega',
          model: 'Speedmaster Professional',
          caliber: 'Cal. 1861',
          serialNumber: 'O749205',
          liftAngleDeg: 50,
          targetVph: 21600,
        });
      },
    });
  }
  return dbPromise;
}

export async function saveEnterpriseSession(session: Omit<EnterpriseSession, 'id'>): Promise<number> {
  const db = await getEnterpriseDB();
  return db.add('sessions', session as EnterpriseSession);
}

export async function getAllEnterpriseSessions(): Promise<EnterpriseSession[]> {
  const db = await getEnterpriseDB();
  return db.getAll('sessions');
}

export async function deleteEnterpriseSession(id: number): Promise<void> {
  const db = await getEnterpriseDB();
  return db.delete('sessions', id);
}

export async function getAllProfiles(): Promise<WatchProfile[]> {
  const db = await getEnterpriseDB();
  return db.getAll('profiles');
}

export async function saveProfile(profile: WatchProfile): Promise<number> {
  const db = await getEnterpriseDB();
  if (profile.id) {
    await db.put('profiles', profile);
    return profile.id;
  } else {
    return db.add('profiles', profile);
  }
}
