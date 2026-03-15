import { useEffect, useState, createContext, useContext } from 'react';
import i18n from '@/components/i18n'; // התיקון כאן: הפנייה לתיקיית components
import { base44 } from '@/api/base44Client';

export const LocaleContext = createContext(null);

export const LocaleProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('appLang') || 'he');
  const [currency, setCurrency] = useState(localStorage.getItem('appCurrency') || 'ILS');
  const direction = lang === 'he' ? 'rtl' : 'ltr';

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('appLang', newLang);
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
  };

  const setAppCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('appCurrency', newCurrency);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('appLang') || 'he';
    // עדכון כיוון הדף (RTL/LTR) בדפדפן בכל טעינה
    document.documentElement.dir = savedLang === 'he' ? 'rtl' : 'ltr';
    if (i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  return (
    <LocaleContext.Provider value={{ lang, currency, direction, changeLanguage, setAppCurrency }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    // Fallback במידה ואין Provider עוטף (מונע קריסה של האתר)
    return { 
      lang: 'he', 
      currency: 'ILS', 
      direction: 'rtl',
      changeLanguage: () => {},
      setAppCurrency: () => {}
    };
  }
  return context;
};