import { useLanguage } from '../context/LanguageContext';

/**
 * CZ | EN language toggle button.
 * variant="default"  — for SupplierSaaS pages (blue primary, dark slate bg)
 * variant="store"    — for store/cart pages (purple accent, pure black bg)
 * variant="minimal"  — small absolute-positioned pill for pages without a nav
 */
export default function LanguageToggle({ variant = 'default', className = '' }) {
    const { lang, toggleLang } = useLanguage();

    const base = 'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-bold transition-colors cursor-pointer';

    const variants = {
        default: 'border border-slate-700 hover:border-primary/50',
        store: 'border border-zinc-800 hover:border-zinc-600 bg-zinc-900/50',
        minimal: 'border border-slate-700 hover:border-primary/50 bg-slate-900/80 backdrop-blur-sm',
    };

    return (
        <button
            onClick={toggleLang}
            className={`${base} ${variants[variant] ?? variants.default} ${className}`}
            aria-label="Toggle language"
        >
            <span className={lang === 'en' ? 'text-white' : 'text-slate-500'}>EN🇬🇧</span>
            <span className="text-slate-600">|</span>
            <span className={lang === 'cs' ? 'text-white' : 'text-slate-500'}>CZ🇨🇿</span>
        </button>
    );
}
