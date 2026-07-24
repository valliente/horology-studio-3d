import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface WatchSession {
  id?: number;
  timestamp: string;
  watchMake: string;
  watchModel: string;
  caliber: string;
  serialNumber: string;
  tag: string; // e.g. "Pre-Service", "Post-Service", "Regulation"
  liftAngleDeg: number;
  vph: number;
  rateSd: number;
  beatErrorMs: number;
  amplitudeDeg: number;
  positionalMetrics?: Record<string, { rateSd: number; amplitudeDeg: number; beatErrorMs: number }>;
  notes: string;
}

export interface MicProfile {
  id?: number;
  name: string;
  type: string; // "Internal", "Clip-On Piezo", "Shotgun", "USB Interface"
  gainBoost: number;
  highPassHz: number;
  lowPassHz: number;
  noiseFloorThreshold: number;
  eqGain1: number; // 2.8 kHz gain
  eqGain2: number; // 4.2 kHz gain
  eqGain3: number; // 5.5 kHz gain
  isDefault?: boolean;
}

interface MicroTimegrapherDB extends DBSchema {
  sessions: {
    key: number;
    value: WatchSession;
    indexes: { 'by-tag': string; 'by-make': string; 'by-timestamp': string };
  };
  micProfiles: {
    key: number;
    value: MicProfile;
    indexes: { 'by-name': string };
  };
}

const DB_NAME = 'MicroTimegrapherProDB';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MicroTimegrapherDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MicroTimegrapherDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Sessions store
        const sessionStore = db.createObjectStore('sessions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        sessionStore.createIndex('by-tag', 'tag');
        sessionStore.createIndex('by-make', 'watchMake');
        sessionStore.createIndex('by-timestamp', 'timestamp');

        // Mic Profiles store
        const profileStore = db.createObjectStore('micProfiles', {
          keyPath: 'id',
          autoIncrement: true,
        });
        profileStore.createIndex('by-name', 'name');

        // Insert default profiles
        profileStore.add({
          name: 'Internal Mic (Laptop/Desktop)',
          type: 'Internal',
          gainBoost: 3.0,
          highPassHz: 2500,
          lowPassHz: 6500,
          noiseFloorThreshold: 0.12,
          eqGain1: 3.0,
          eqGain2: 5.0,
          eqGain3: 2.0,
          isDefault: true,
        });

        profileStore.add({
          name: 'Clip-On Piezo Acoustic Pickup',
          type: 'Clip-On Piezo',
          gainBoost: 1.5,
          highPassHz: 2000,
          lowPassHz: 7500,
          noiseFloorThreshold: 0.08,
          eqGain1: 4.0,
          eqGain2: 6.0,
          eqGain3: 4.0,
        });

        profileStore.add({
          name: 'Studio Shotgun Condenser Mic',
          type: 'Shotgun',
          gainBoost: 4.5,
          highPassHz: 2800,
          lowPassHz: 6000,
          noiseFloorThreshold: 0.15,
          eqGain1: 2.0,
          eqGain2: 4.0,
          eqGain3: 2.0,
        });
      },
    });
  }
  return dbPromise;
}

export async function saveSession(session: Omit<WatchSession, 'id'>): Promise<number> {
  const db = await getDB();
  return db.add('sessions', session as WatchSession);
}

export async function getAllSessions(): Promise<WatchSession[]> {
  const db = await getDB();
  return db.getAll('sessions');
}

export async function deleteSession(id: number): Promise<void> {
  const db = await getDB();
  return db.delete('sessions', id);
}

export async function getAllMicProfiles(): Promise<MicProfile[]> {
  const db = await getDB();
  return db.getAll('micProfiles');
}

export async function saveMicProfile(profile: MicProfile): Promise<number> {
  const db = await getDB();
  if (profile.id) {
    await db.put('micProfiles', profile);
    return profile.id;
  } else {
    return db.add('micProfiles', profile);
  }
}
