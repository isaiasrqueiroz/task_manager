import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

type Translations = Record<string, any>;
type Language = 'en' | 'pt-br';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getNestedValue = (obj: any, path: string): string | undefined => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialLanguage = (): Language => {
    const storedLang = localStorage.getItem('language');
    if (storedLang === 'en' || storedLang === 'pt-br') {
        return storedLang;
    }
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'en' ? 'en' : 'pt-br';
  };
  
  const [language, setLanguage] = useState<Language>(getInitialLanguage());
  const [translations, setTranslations] = useState<Translations | null>(null);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    const loadTranslations = async (lang: Language) => {
      try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error(`Failed to load translations for ${lang}:`, error);
        // On initial load error, set to empty object to avoid repeated fetch attempts.
        // On subsequent errors (language change), we keep the old translations.
        if (translations === null) {
          setTranslations({});
        }
      }
    };
    loadTranslations(language);
  }, [language]);

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    if (translations === null) {
      return key; // Return key while translations are loading for the first time
    }
    
    let translation = getNestedValue(translations, key);

    if (translation === undefined) {
      return key; // Return key if not found in the loaded file
    }
    
    if (options) {
      Object.keys(options).forEach(optKey => {
        translation = (translation as string).replace(`{{${optKey}}}`, String(options[optKey]));
      });
    }

    return translation;
  }, [translations]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};
