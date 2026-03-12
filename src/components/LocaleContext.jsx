import React, { createContext, useContext, useState, useEffect } from 'react';
import '../components/i18n.js';
import i18n from 'i18next';

export const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const l = (typeof window !== 'undefined' && localStorage.getItem('appLang')) || 'he';
    if (typeof document !== 'undefined') {
      document.documentElement.dir = l === 'he' ? 'rtl' : 'ltr';
      document.documentElement.lang = l;
    }
    return l;
  });

  const [currency, setCurrency] = useState(
    () => (typeof window !== 'undefined' && localStorage.getItem('appCurrency')) || 'ILS'
  );

  useEffect(() => {
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    i18n.changeLanguage(lang);
  }, [lang]);

  const changeLanguage = (newLang) => {
    const newCurrency = newLang === 'he' ? 'ILS' : 'USD';
    setLang(newLang);
    setCurrency(newCurrency);
    localStorage.setItem('appLang', newLang);
    localStorage.setItem('appCurrency', newCurrency);
  };

  return (
    <LocaleContext.Provider value={{ lang, currency, changeLanguage }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => useContext(LocaleContext);

export function formatCurrency(amount, currency = 'ILS') {
  const symbol = currency === 'USD' ? '$' : '₪';
  return `${symbol}${(amount || 0).toLocaleString()}`;
}