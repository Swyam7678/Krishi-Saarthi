import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { translations, Language } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

// Provide a safe default context to prevent crashes if used outside provider
const defaultContext: LanguageContextType = {
  language: 'en',
  setLanguage: () => console.warn("LanguageProvider not found. setLanguage ignored."),
  t: (key) => (translations['en'] as any)[key] || key,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Lazy initialization to prevent hydration mismatch and extra renders
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('app-language') as Language;
      if (savedLang && ['en', 'hi', 'pa', 'mr', 'ta', 'gu', 'bn', 'bho', 'sat', 'kn'].includes(savedLang)) {
        return savedLang;
      }
    }
    return 'hi'; // Default to Hindi
  });

  useEffect(() => {
    console.log("LanguageProvider mounted, current language:", language);
  }, []);

  const handleSetLanguage = useCallback((lang: Language) => {
    console.log("Language switching to:", lang);
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  }, []);

  const t = useCallback((key: keyof typeof translations['en']) => {
    const langData = (translations as any)[language];
    return langData?.[key] || translations['en'][key] || key;
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
  // Context will now fallback to defaultContext instead of being undefined
  return context;
}