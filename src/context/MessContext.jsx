import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import db from '../db';
import { clearMessData } from '../db';

const MessContext = createContext(null);

export function MessProvider({ children }) {
  const [messList, setMessList] = useState([]);
  const [activeMessId, setActiveMessId] = useState(null);
  const [activeMess, setActiveMess] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---- Helper: persist activeMessId to settings table ----
  const persistActiveMessId = useCallback(async (id) => {
    try {
      const existing = await db.settings.where('key').equals('activeMessId').first();
      if (existing) {
        await db.settings.update(existing.id, { value: id });
      } else {
        await db.settings.add({ key: 'activeMessId', value: id });
      }
    } catch (err) {
      console.error('Failed to persist activeMessId:', err);
    }
  }, []);

  // ---- Helper: load active mess object by id ----
  const loadActiveMess = useCallback(async (id) => {
    if (!id) {
      setActiveMess(null);
      return;
    }
    try {
      const mess = await db.messProfiles.get(id);
      setActiveMess(mess || null);
    } catch (err) {
      console.error('Failed to load active mess:', err);
      setActiveMess(null);
    }
  }, []);

  // ---- Load mess list and restore active mess on mount ----
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const allMess = await db.messProfiles.orderBy('createdAt').toArray();
      setMessList(allMess);

      // Restore last active mess from settings
      const setting = await db.settings.where('key').equals('activeMessId').first();
      let targetId = setting?.value || null;

      // Validate that the saved mess still exists
      if (targetId && !allMess.find((m) => m.id === targetId)) {
        targetId = allMess.length > 0 ? allMess[0].id : null;
      }

      // If no saved preference, pick the first mess
      if (!targetId && allMess.length > 0) {
        targetId = allMess[0].id;
      }

      setActiveMessId(targetId);
      await persistActiveMessId(targetId);
      await loadActiveMess(targetId);
    } catch (err) {
      console.error('Failed to load initial mess data:', err);
    } finally {
      setLoading(false);
    }
  }, [persistActiveMessId, loadActiveMess]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ---- Create a new mess profile ----
  const createMess = useCallback(async (data) => {
    const now = new Date().toISOString();
    const newMess = {
      name: data.name.trim(),
      address: (data.address || '').trim(),
      managerName: (data.managerName || '').trim(),
      managerPhone: (data.managerPhone || '').trim(),
      createdAt: now,
      updatedAt: now,
    };

    const id = await db.messProfiles.add(newMess);
    newMess.id = id;

    setMessList((prev) => [...prev, newMess].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
    await switchMess(id);

    return newMess;
  }, []);

  // ---- Update an existing mess profile ----
  const updateMess = useCallback(async (id, data) => {
    const updates = {
      name: data.name?.trim(),
      address: data.address?.trim(),
      managerName: data.managerName?.trim(),
      managerPhone: data.managerPhone?.trim(),
      updatedAt: new Date().toISOString(),
    };

    await db.messProfiles.update(id, updates);

    setMessList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );

    // If updating the currently active mess, refresh activeMess object
    if (id === activeMessId) {
      setActiveMess((prev) => (prev ? { ...prev, ...updates } : null));
    }

    return updates;
  }, [activeMessId]);

  // ---- Delete a mess profile and all its data ----
  const deleteMess = useCallback(async (id) => {
    await clearMessData(id);
    await db.messProfiles.delete(id);

    setMessList((prev) => {
      const filtered = prev.filter((m) => m.id !== id);

      // If we deleted the active mess, switch to the next available
      if (id === activeMessId) {
        const next = filtered.length > 0 ? filtered[0].id : null;
        // Use a microtask to avoid calling setState during render
        setTimeout(() => switchMess(next), 0);
      }

      return filtered;
    });
  }, [activeMessId]);

  // ---- Switch active mess ----
  const switchMess = useCallback(async (id) => {
    setActiveMessId(id);
    await persistActiveMessId(id);
    await loadActiveMess(id);
  }, [persistActiveMessId, loadActiveMess]);

  // ---- Refresh mess list (e.g., after restore) ----
  const refreshMessList = useCallback(async () => {
    try {
      const allMess = await db.messProfiles.orderBy('createdAt').toArray();
      setMessList(allMess);

      // Re-validate active mess
      if (activeMessId && !allMess.find((m) => m.id === activeMessId)) {
        const next = allMess.length > 0 ? allMess[0].id : null;
        await switchMess(next);
      } else {
        await loadActiveMess(activeMessId);
      }
    } catch (err) {
      console.error('Failed to refresh mess list:', err);
    }
  }, [activeMessId, switchMess, loadActiveMess]);

  const value = {
    messList,
    activeMessId,
    activeMess,
    loading,
    hasMess: messList.length > 0,
    createMess,
    updateMess,
    deleteMess,
    switchMess,
    refreshMessList,
  };

  return <MessContext.Provider value={value}>{children}</MessContext.Provider>;
}

export function useMessContext() {
  const ctx = useContext(MessContext);
  if (!ctx) {
    throw new Error('useMessContext must be used within a MessProvider');
  }
  return ctx;
}

export default MessContext;
