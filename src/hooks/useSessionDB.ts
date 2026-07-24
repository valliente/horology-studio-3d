import { useState, useEffect, useCallback } from 'react';
import { WatchSession, MicProfile, getAllSessions, saveSession, deleteSession, getAllMicProfiles, saveMicProfile } from '../db/SessionDatabase';

export function useSessionDB() {
  const [sessions, setSessions] = useState<WatchSession[]>([]);
  const [micProfiles, setMicProfiles] = useState<MicProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedSessions = await getAllSessions();
      const loadedProfiles = await getAllMicProfiles();
      setSessions(loadedSessions);
      setMicProfiles(loadedProfiles);
    } catch (err) {
      console.error('Failed to load IndexedDB data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addSession = async (session: Omit<WatchSession, 'id'>) => {
    const id = await saveSession(session);
    await refreshData();
    return id;
  };

  const removeSession = async (id: number) => {
    await deleteSession(id);
    await refreshData();
  };

  const addMicProfile = async (profile: MicProfile) => {
    const id = await saveMicProfile(profile);
    await refreshData();
    return id;
  };

  return {
    sessions,
    micProfiles,
    isLoading,
    refreshData,
    addSession,
    removeSession,
    addMicProfile,
  };
}
