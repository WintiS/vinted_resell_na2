import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '../locales/en';
import cs from '../locales/cs';

const locales = { en, cs };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState('en');

    // Load persisted language from localStorage after mount (avoids SSR mismatch)
    useEffect(() => {
        const saved = localStorage.getItem('lang');
        if (saved === 'en' || saved === 'cs') {
            setLang(saved);
            return;
        }

        // If no saved preference, detect browser language on first visit
        if (typeof navigator !== 'undefined') {
            const browserLang = navigator.language || navigator.userLanguage;
            if (browserLang && browserLang.toLowerCase().startsWith('cs')) {
                setLang('cs');
            } else {
                setLang('en');
            }
        }
    }, []);

    const toggleLang = useCallback(() => {
        setLang(prev => {
            const next = prev === 'en' ? 'cs' : 'en';
            localStorage.setItem('lang', next);
            return next;
        });
    }, []);

    // t(key, vars?) — translates a key, with optional {placeholder} interpolation
    const t = useCallback((key, vars = {}) => {
        let str = locales[lang]?.[key] ?? locales['en']?.[key] ?? key;
        Object.entries(vars).forEach(([k, v]) => {
            str = str.replace(`{${k}}`, String(v));
        });
        return str;
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
}
