import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en.json';
import bn from '../i18n/bn.json';

const LangContext = createContext();

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang must be used within a LangProvider");
  return context;
};

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const [translations, setTranslations] = useState(en);

  useEffect(() => {
    const savedLang = localStorage.getItem('mess_bondhu_lang') || 'en';
    setLang(savedLang);
    setTranslations(savedLang === 'bn' ? bn : en);
  }, []);

  const toggleLang = (newLang) => {
    const selected = newLang || (lang === 'en' ? 'bn' : 'en');
    setLang(selected);
    setTranslations(selected === 'bn' ? bn : en);
    localStorage.setItem('mess_bondhu_lang', selected);
  };

  const t = (key) => {
    return translations[key] || key; // Fallback to key if translation missing
  };

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
};
