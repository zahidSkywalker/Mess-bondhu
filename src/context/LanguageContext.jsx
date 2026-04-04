import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import db from '../db';
import en from '../i18n/en';
import bn from '../i18n/bn';

const translations = { en, bn };

const LanguageContext = createContext(null);

/**
 * Resolve a dot-notation key path against an object.
 * e.g., resolvePath('dashboard.title', obj) → obj.dashboard.title
 * Returns the key string itself if path not found (graceful fallback).
 */
function resolvePath(path, obj) {
  if (!path || typeof path !== 'string') return path;
  const keys = path.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return path; // Fallback: return the raw key
    }
    current = current[key];
  }
  return current !== undefined && current !== null ? current : path;
}

/**
 * Replace {placeholder} tokens in a string with values from a params object.
 * e.g., interpolate('{count} দিন আগে', { count: '৫' }) → '৫ দিন আগে'
 */
function interpolate(template, params) {
  if (!template || typeof template !== 'string') return template;
  if (!params || typeof params !== 'object') return template;

  return template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    return value !== undefined && value !== null ? String(value) : match;
  });
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('bn');
  const [initialized, setInitialized] = useState(false);

  // ---- Persist language to settings table ----
  const persistLanguage = useCallback(async (lang) => {
    try {
      const existing = await db.settings.where('key').equals('language').first();
      if (existing) {
        await db.settings.update(existing.id, { value: lang });
      } else {
        await db.settings.add({ key: 'language', value: lang });
      }
    } catch (err) {
      console.error('Failed to persist language:', err);
    }
  }, []);

  // ---- Update <html> lang attribute ----
  const applyLanguage = useCallback((lang) => {
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
  }, []);

  // ---- Load language from DB on mount ----
  useEffect(() => {
    async function loadLanguage() {
      try {
        const setting = await db.settings.where('key').equals('language').first();
        const saved = setting?.value || 'bn';
        setLanguageState(saved);
        applyLanguage(saved);
      } catch (err) {
        console.error('Failed to load language:', err);
        setLanguageState('bn');
        applyLanguage('bn');
      } finally {
        setInitialized(true);
      }
    }
    loadLanguage();
  }, [applyLanguage]);

  // ---- Set language (called by user) ----
  const setLanguage = useCallback((lang) => {
    if (lang !== 'en' && lang !== 'bn') return;
    setLanguageState(lang);
    applyLanguage(lang);
    persistLanguage(lang);
  }, [applyLanguage, persistLanguage]);

  // ---- Toggle between Bengali and English ----
  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  }, [language, setLanguage]);

  // ---- Translation function ----
  // Usage: t('dashboard.title') → 'ড্যাশবোর্ড' or 'Dashboard'
  // Usage: t('time.daysAgo', { count: 5 }) → '5 দিন আগে' or '5d ago'
  const t = useCallback(
    (key, params = null) => {
      const dict = translations[language] || translations.bn;
      const resolved = resolvePath(key, dict);
      return interpolate(resolved, params);
    },
    [language]
  );

  // ---- Check if current language is Bengali ----
  const isBn = language === 'bn';

  // ---- Memoize context value to prevent unnecessary re-renders ----
  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      isBn,
      isEn: !isBn,
      initialized,
    }),
    [language, setLanguage, toggleLanguage, t, isBn, initialized]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguageContext() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return ctx;
}

export default LanguageContext;
