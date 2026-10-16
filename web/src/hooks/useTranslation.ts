import { useState } from 'react';
import pt from '../locales/pt.json';
import en from '../locales/en.json';

const translations: Record<string, any> = { pt, en };

export const useTranslation = () => {
    const [lang, setLang] = useState<'pt' | 'en'>('pt');

    const toggleLang = () => {
        setLang(prev => (prev === 'pt' ? 'en' : 'pt'));
    };

    const t = (path: string) => {
        const keys = path.split('.');
        let current = translations[lang];

        for (const key of keys) {
            if (current && current[key] !== undefined) {
                current = current[key];
            } else {
                return path;
            }
        }
        return current;
    };

    return { t, lang, toggleLang };
};