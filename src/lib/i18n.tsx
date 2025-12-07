import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { translations, Language } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage to avoid re-render on mount
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('app-language') as Language;
      if (savedLang && ['en', 'hi', 'pa', 'mr', 'ta', 'gu', 'bn'].includes(savedLang)) {
        return savedLang;
      }
    } catch (e) {
      console.error("Failed to read language from localStorage", e);
    }
    return 'hi'; // Default to Hindi
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem('app-language', lang);
    } catch (e) {
      console.error("Failed to save language to localStorage", e);
    }
  }, []);

  const t = useCallback((key: keyof typeof translations['en']) => {
    return translations[language]?.[key] || translations['en'][key] || key;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage: handleSetLanguage,
    t
  }), [language, handleSetLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}