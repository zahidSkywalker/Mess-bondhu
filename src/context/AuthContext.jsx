import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../db/db';
import { useLiveQuery } from 'dexie-react-hooks';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [activeMessId, setActiveMessId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch list of all messes
  const messes = useLiveQuery(() => db.messProfiles.toArray(), []);

  useEffect(() => {
    // Restore last active mess from local storage
    const savedId = localStorage.getItem('mess_bondhu_active_mess');
    if (savedId) {
      setActiveMessId(parseInt(savedId));
    }
    setLoading(false);
  }, []);

  const switchMess = (id) => {
    setActiveMessId(id);
    localStorage.setItem('mess_bondhu_active_mess', id);
  };

  const createMess = async (name) => {
    try {
      const id = await db.messProfiles.add({
        name,
        createdAt: new Date()
      });
      // Switch to the new mess immediately
      switchMess(id);
      return true;
    } catch (error) {
      console.error("Error creating mess:", error);
      return false;
    }
  };

  const logout = () => {
    setActiveMessId(null);
    localStorage.removeItem('mess_bondhu_active_mess');
  };

  // Get active mess object
  const activeMess = messes?.find(m => m.id === activeMessId);

  const value = {
    activeMessId,
    activeMess,
    messes: messes || [],
    switchMess,
    createMess,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
