import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { translations, Language } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Lazy initialization to prevent hydration mismatch and extra renders
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('app-language') as Language;
      if (savedLang && Object.keys(translations).includes(savedLang)) {
        return savedLang;
      }
    }
    return 'hi'; // Default to Hindi
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    console.log("Language switching to:", lang);
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  }, []);

  const t = useCallback((key: keyof typeof translations['en']) => {
    const langData = translations[language] as Record<string, string> | undefined;
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
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}