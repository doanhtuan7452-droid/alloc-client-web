import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "../locales/en";
import { vi } from "../locales/vi";

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem("language") || "en";
  });

  const translations = locale === "vi" ? vi : en;

  const t = (key, fallback = "") => {
    const keys = key.split(".");
    let current = translations;
    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        // Fallback to English if translation key is missing in the current locale
        let enCurrent = en;
        for (const enK of keys) {
          if (enCurrent && enCurrent[enK] !== undefined) {
            enCurrent = enCurrent[enK];
          } else {
            enCurrent = null;
            break;
          }
        }
        return enCurrent !== null ? enCurrent : (fallback || key);
      }
    }
    return current;
  };

  const changeLanguage = (lang) => {
    setLocale(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider value={{ locale, t, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
