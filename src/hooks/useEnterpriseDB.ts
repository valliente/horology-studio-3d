import { useState, useEffect, useCallback } from 'react';
import {
  EnterpriseSession,
  WatchProfile,
  getAllEnterpriseSessions,
  saveEnterpriseSession,
  deleteEnterpriseSession,
  getAllProfiles,
  saveProfile
} from '../db/EnterpriseDatabase';

export function useEnterpriseDB() {
  const [sessions, setSessions] = useState<EnterpriseSession[]>([]);
  const [profiles, setProfiles] = useState<WatchProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const loadedSessions = await getAllEnterpriseSessions();
      const loadedProfiles = await getAllProfiles();
      setSessions(loadedSessions);
      setProfiles(loadedProfiles);
    } catch (err) {
      console.error('Failed to load Enterprise DB:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addSession = async (session: Omit<EnterpriseSession, 'id'>) => {
    const id = await saveEnterpriseSession(session);
    await refreshData();
    return id;
  };

  const removeSession = async (id: number) => {
    await deleteEnterpriseSession(id);
    await refreshData();
  };

  const addWatchProfile = async (profile: WatchProfile) => {
    const id = await saveProfile(profile);
    await refreshData();
    return id;
  };

  return {
    sessions,
    profiles,
    isLoading,
    refreshData,
    addSession,
    removeSession,
    addWatchProfile,
  };
}
