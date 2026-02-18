import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

// Live Sales Section Component
function LiveSalesSection() {
    const router = useRouter();
    const { t, lang } = useLanguage();
    const [countdown, setCountdown] = useState(5);
    const [products] = useState([
        { id: 1, title: 'All Premium Suppliers Links Bundle', sales: 21, revenue: 1525.97, image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop' },
        { id: 2, title: 'All Regular Supplier Links Bundle', sales: 32, revenue: 729.80, image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=300&fit=crop' },
        { id: 3, title: 'Branded Knitwear Suppliers', sales: 28, revenue: 445.34, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=300&fit=crop' },
        { id: 4, title: 'Nike Clothing Suppliers', sales: 17, revenue: 93.45, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop' },
        { id: 5, title: 'Windbreaker Suppliers', sales: 16, revenue: 84.12, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop' },
        { id: 6, title: 'Burberry Scarfs Suppliers', sales: 14, revenue: 69.23, image: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&h=300&fit=crop' }
    ]);
    const [salesData, setSalesData] = useState(products);

    const revenueLocale = lang === 'cs' ? 'cs-CZ' : 'en-US';
    const revenueCurrency = lang === 'cs' ? 'CZK' : 'USD';
    const formatRevenue = (amountUsd) =>
        new Intl.NumberFormat(revenueLocale, {
            style: 'currency',
            currency: revenueCurrency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(lang === 'cs' ? amountUsd * 23 : amountUsd);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setSalesData((currentData) => {
                        const newData = [...currentData];
                        const randomIndex = Math.floor(Math.random() * newData.length);
                        newData[randomIndex] = { ...newData[randomIndex], sales: newData[randomIndex].sales + 1 };
                        return newData;
                    });
                    return 5;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-24 bg-background-dark">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-primary text-sm font-bold">{t('liveSales.live', { countdown })}</span>
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-4">
                        {t('liveSales.title')}
                    </h2>
                    <p className="text-slate-400 text-lg max-w-3xl mx-auto">
                        {t('liveSales.subtitleBefore')}
                    </p>
                </div>

                <div className="relative overflow-hidden">
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                        {salesData.map((product) => (
                            <div
                                key={product.id}
                                className="flex-shrink-0 w-80 bg-slate-900/50 border border-slate-700 rounded-2xl overflow-hidden hover:border-primary/50 transition-all snap-center"
                            >
                                <div className="aspect-video bg-slate-800 overflow-hidden">
                                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-white font-bold text-lg mb-4 min-h-[56px]">{product.title}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-slate-500 text-xs mb-1">{t('liveSales.revenue')}</p>
                                            <p className="text-green-500 font-bold text-xl">
                                                {formatRevenue(product.revenue)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500 text-xs mb-1">{t('liveSales.sales')}</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-bold text-xl">{product.sales}</p>
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-bold">
                                                    <span className="material-icons text-xs">arrow_upward</span>
                                                    +1
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-8">
                    <p className="text-slate-500 text-sm">{t('liveSales.scrollHint')}</p>
                </div>
            </div>

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </section>
    );
}

export default function Home() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isYearly, setIsYearly] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const { t, lang } = useLanguage();

    const USD_TO_CZK = 23;
    const pricingLocale = lang === 'cs' ? 'cs-CZ' : 'en-US';
    const pricingCurrency = lang === 'cs' ? 'CZK' : 'USD';
    const formatPriceFromUsd = (amountUsd) =>
        new Intl.NumberFormat(pricingLocale, {
            style: 'currency',
            currency: pricingCurrency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(lang === 'cs' ? amountUsd * USD_TO_CZK : amountUsd);

    // Countdown to midnight
    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        };
        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, []);

    const pricingConfig = {
        monthly: { price: 29, originalPrice: 42, priceId: 'price_1T0ekuK0Js68kvLkMYhxx8CM', interval: 'month' },
        yearly: { price: 290, originalPrice: 414, priceId: 'price_1T0elcK0Js68kvLk6VSn2qZi', interval: 'year' }
    };

    const currentPlan = isYearly ? pricingConfig.yearly : pricingConfig.monthly;
    const discountPercent = Math.round(((currentPlan.originalPrice - currentPlan.price) / currentPlan.originalPrice) * 100);

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-dark">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    const testimonials = [
        { quoteKey: 'testimonials.t1.quote', nameKey: 'testimonials.t1.name', roleKey: 'testimonials.t1.role' },
        { quoteKey: 'testimonials.t2.quote', nameKey: 'testimonials.t2.name', roleKey: 'testimonials.t2.role' },
        { quoteKey: 'testimonials.t3.quote', nameKey: 'testimonials.t3.name', roleKey: 'testimonials.t3.role' },
    ];

    return (
        <>
            <Head>
                <title>{t('index.pageTitle')}</title>
                <meta name="description" content={t('index.metaDesc')} />
                <link rel="icon" href="/favicon.ico" />
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>

            <div className="bg-background-dark text-white min-h-screen overflow-x-hidden">
                {/* Navigation */}
                <nav className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-slate-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16 md:h-20">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                                    <span className="material-icons text-white text-xl md:text-2xl">rocket_launch</span>
                                </div>
                                <span className="text-lg md:text-xl font-extrabold tracking-tight text-white">
                                    Supply<span className="text-primary">Point</span>
                                </span>
                            </div>
                            <div className="hidden md:flex items-center space-x-8">
                                <a className="text-sm font-semibold text-slate-400 hover:text-white transition-colors" href="#features">{t('nav.features')}</a>
                                <a className="text-sm font-semibold text-slate-400 hover:text-white transition-colors" href="#how-it-works">{t('nav.howItWorks')}</a>
                                <a className="text-sm font-semibold text-slate-400 hover:text-white transition-colors" href="#pricing">{t('nav.pricing')}</a>
                                <LanguageToggle />
                                <button onClick={() => router.push('/login')} className="text-sm font-semibold text-white border border-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all">
                                    {t('nav.login')}
                                </button>
                                <button onClick={() => router.push('/signup')} className="text-sm font-semibold bg-gradient-primary text-white px-6 py-2.5 rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all">
                                    {t('nav.signup')}
                                </button>
                            </div>
                            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                <span className="material-icons text-white">{mobileMenuOpen ? 'close' : 'menu'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden bg-background-dark border-t border-slate-800">
                            <div className="px-4 py-4 space-y-3">
                                <a className="block text-sm font-semibold text-slate-400 hover:text-white transition-colors py-2" href="#features" onClick={() => setMobileMenuOpen(false)}>{t('nav.features')}</a>
                                <a className="block text-sm font-semibold text-slate-400 hover:text-white transition-colors py-2" href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>{t('nav.howItWorks')}</a>
                                <a className="block text-sm font-semibold text-slate-400 hover:text-white transition-colors py-2" href="#pricing" onClick={() => setMobileMenuOpen(false)}>{t('nav.pricing')}</a>
                                <button onClick={() => router.push('/login')} className="w-full text-sm font-semibold text-white border border-slate-700 px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all">
                                    {t('nav.login')}
                                </button>
                                <button onClick={() => router.push('/signup')} className="w-full text-sm font-semibold bg-gradient-primary text-white px-6 py-2.5 rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all">
                                    {t('nav.startFreeTrial')}
                                </button>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Hero Section */}
                <header className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 lg:pt-32 lg:pb-40">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(59,130,246,0.15)_0%,transparent_100%)]"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs md:text-sm font-bold mb-6 md:mb-8">
                            <LanguageToggle />
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs md:text-sm font-bold mb-6 md:mb-8">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                            {t('hero.badge')}
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-4 md:mb-6">
                            {t('hero.titleLine1')} <br /> <span className="text-gradient">{t('hero.titleHighlight')}</span> {t('hero.titleLine2')}
                        </h1>
                        <p className="max-w-2xl mx-auto text-base md:text-xl text-slate-400 mb-8 md:mb-10 leading-relaxed px-4">
                            {t('hero.subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button
                                onClick={() => router.push('/signup')}
                                className="w-full sm:w-auto px-10 py-5 bg-gradient-primary text-white text-lg font-bold rounded-xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                            >
                                {t('hero.ctaPrimary')}
                            </button>
                            <button className="w-full sm:w-auto px-10 py-5 bg-slate-800/50 backdrop-blur-sm text-white text-lg font-bold rounded-xl border border-slate-700 hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                                <span className="material-icons">play_circle</span>
                                {t('hero.ctaSecondary')}
                            </button>
                        </div>
                        <div className="mt-12 md:mt-20 relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-[3rem] -z-10"></div>
                            <div className="rounded-2xl border border-slate-700 shadow-2xl bg-slate-900/50 p-2 backdrop-blur-sm">
                                <img
                                    className="rounded-xl w-full h-auto object-cover max-h-[600px] brightness-90 grayscale-[0.2]"
                                    alt="Modern SaaS dashboard showing sales analytics and supplier inventory"
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Scrolling Tools Banner */}
                <section className="py-12 bg-slate-900/30 border-y border-slate-800 overflow-hidden">
                    <div className="text-center mb-8 px-4">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{t('banner.title')}</h3>
                        <p className="text-slate-400 text-lg">
                            {t('banner.subtitleBefore')} <span className="text-primary font-bold">{t('banner.subtitleHighlight')}</span>{t('banner.subtitleAfter')}
                        </p>
                    </div>
                    <div className="relative">
                        <style jsx>{`
                            @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
                            .scroll-container { animation: scroll-left 30s linear infinite; }
                            .scroll-container:hover { animation-play-state: paused; }
                        `}</style>
                        <div className="flex scroll-container">
                            {[0, 1].map((set) => (
                                <div key={set} className="flex items-center gap-12 px-6 flex-shrink-0">
                                    {[
                                        { icon: 'shopping_cart', label: 'Copywriting' },
                                        { icon: 'store', label: 'Shopify' },
                                        { icon: 'language', label: 'Stripe' },
                                        { icon: 'web', label: 'Squarespace' },
                                        { icon: 'payment', label: 'Stripe' },
                                        { icon: 'account_balance', label: 'PayPal' },
                                        { icon: 'inventory', label: 'BigCommerce' },
                                        { icon: 'local_shipping', label: 'Vinted' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 px-6 py-4 bg-slate-800/50 rounded-xl border border-slate-700">
                                            <span className="material-icons text-primary text-3xl">{item.icon}</span>
                                            <span className="text-white font-bold text-lg">{item.label}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section className="py-24 bg-slate-900/50" id="how-it-works">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">{t('hiw.title')}</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto text-lg">{t('hiw.subtitle')}</p>
                        </div>

                        {/* Step 1 */}
                        <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
                            <div className="order-2 lg:order-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                                        <span className="material-icons text-white text-2xl">person_add_alt</span>
                                    </div>
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold">
                                        <span className="material-icons text-sm">check_circle</span>
                                        {t('hiw.step1.badge')}
                                    </span>
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
                                    {t('hiw.step1.title')} <span className="text-gradient">{t('hiw.step1.highlight')}</span>
                                </h3>
                                <p className="text-slate-400 text-lg mb-6 leading-relaxed">{t('hiw.step1.desc')}</p>
                                <button onClick={() => router.push('/signup')} className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all">
                                    {t('hiw.step1.cta')} <span className="material-icons">arrow_forward</span>
                                </button>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-3xl -z-10"></div>
                                    <div className="rounded-2xl border border-slate-700 shadow-2xl bg-slate-900/50 p-2 backdrop-blur-sm overflow-hidden">
                                        <img className="rounded-xl w-full h-auto object-cover" alt="Dashboard signup interface" src="https://images.unsplash.com/photo-1555421689-d68471e189f2?w=800&h=600&fit=crop" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
                            <div className="order-1">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 blur-3xl rounded-3xl -z-10"></div>
                                    <div className="rounded-2xl border border-slate-700 shadow-2xl bg-slate-900/50 p-2 backdrop-blur-sm overflow-hidden">
                                        <img className="rounded-xl w-full h-auto object-cover" alt="Store customization panel" src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop" />
                                    </div>
                                </div>
                            </div>
                            <div className="order-2">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                                        <span className="material-icons text-white text-2xl">dashboard_customize</span>
                                    </div>
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold">
                                        <span className="material-icons text-sm">palette</span>
                                        {t('hiw.step2.badge')}
                                    </span>
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
                                    {t('hiw.step2.title')} <span className="text-gradient">{t('hiw.step2.highlight')}</span>
                                </h3>
                                <p className="text-slate-400 text-lg mb-6 leading-relaxed">{t('hiw.step2.desc')}</p>
                                <button onClick={() => router.push('/signup')} className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all">
                                    {t('hiw.step2.cta')} <span className="material-icons">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="grid lg:grid-cols-2 gap-12 items-center mb-32">
                            <div className="order-2 lg:order-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                                        <span className="material-icons text-white text-2xl">rocket_launch</span>
                                    </div>
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold">
                                        <span className="material-icons text-sm">bolt</span>
                                        {t('hiw.step3.badge')}
                                    </span>
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
                                    {t('hiw.step3.title')} <span className="text-gradient">{t('hiw.step3.highlight')}</span>
                                </h3>
                                <p className="text-slate-400 text-lg mb-6 leading-relaxed">{t('hiw.step3.desc')}</p>
                                <button onClick={() => router.push('/signup')} className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all">
                                    {t('hiw.step3.cta')} <span className="material-icons">arrow_forward</span>
                                </button>
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-3xl -z-10"></div>
                                    <div className="rounded-2xl border border-slate-700 shadow-2xl bg-slate-900/50 p-3 backdrop-blur-sm overflow-hidden">
                                        <div className="bg-slate-800 rounded-t-lg px-4 py-2 flex items-center gap-2 mb-2">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                            </div>
                                            <div className="flex-1 text-center text-xs text-slate-400">yourstorename.com</div>
                                        </div>
                                        <img className="rounded-b-xl w-full h-auto object-cover" alt="Landing page preview" src="https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&h=600&fit=crop" />
                                        <p className="text-center text-xs text-slate-500 mt-3">{t('hiw.step3.linkNote')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 4 */}
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="order-1">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-gradient-to-r from-accent/20 to-primary/20 blur-3xl rounded-3xl -z-10"></div>
                                    <div className="rounded-2xl border border-slate-700 shadow-2xl bg-slate-900/50 p-2 backdrop-blur-sm overflow-hidden">
                                        <img className="rounded-xl w-full h-auto object-cover" alt="Payment notifications showing 100% profit" src="/brain/bef7397b-704c-4cbc-a333-2ec7c41628cc/payment_notifications_mockup_1771351729102.png" />
                                        <p className="text-center text-xs text-slate-500 mt-3">{t('hiw.step4.profitNote')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="order-2">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                                        <span className="material-icons text-white text-2xl">payments</span>
                                    </div>
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-bold">
                                        <span className="material-icons text-sm">account_balance_wallet</span>
                                        {t('hiw.step4.badge')}
                                    </span>
                                </div>
                                <h3 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
                                    {t('hiw.step4.title')} <span className="text-gradient">{t('hiw.step4.highlight')}</span>
                                </h3>
                                <p className="text-slate-400 text-lg mb-6 leading-relaxed">{t('hiw.step4.desc')}</p>
                                <button onClick={() => router.push('/signup')} className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all">
                                    {t('hiw.step4.cta')} <span className="material-icons">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-24 bg-slate-900/30 border-y border-slate-800" id="features">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-14">
                            <span className="text-primary font-bold text-sm uppercase tracking-widest">{t('features.badge')}</span>
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mt-4 mb-5 leading-tight">
                                {t('features.title')}
                            </h2>
                            <p className="text-slate-400 text-lg max-w-3xl mx-auto">{t('features.subtitle')}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {[
                                {
                                    icon: 'rocket_launch',
                                    labelKey: 'features.cards.storeReady.label',
                                    titleKey: 'features.cards.storeReady.title',
                                    descKey: 'features.cards.storeReady.desc',
                                    iconWrapClass: 'bg-amber-500/15 border-amber-500/25',
                                    iconClass: 'text-amber-400',
                                },
                                {
                                    icon: 'handyman',
                                    labelKey: 'features.cards.noTechSkills.label',
                                    titleKey: 'features.cards.noTechSkills.title',
                                    descKey: 'features.cards.noTechSkills.desc',
                                    iconWrapClass: 'bg-green-500/15 border-green-500/25',
                                    iconClass: 'text-green-400',
                                },
                                {
                                    icon: 'trending_up',
                                    labelKey: 'features.cards.revenueOptimization.label',
                                    titleKey: 'features.cards.revenueOptimization.title',
                                    descKey: 'features.cards.revenueOptimization.desc',
                                    iconWrapClass: 'bg-red-500/15 border-red-500/25',
                                    iconClass: 'text-red-400',
                                },
                                {
                                    icon: 'inventory_2',
                                    labelKey: 'features.cards.broadSuppliers.label',
                                    titleKey: 'features.cards.broadSuppliers.title',
                                    descKey: 'features.cards.broadSuppliers.desc',
                                    iconWrapClass: 'bg-purple-500/15 border-purple-500/25',
                                    iconClass: 'text-purple-400',
                                },
                            ].map((card) => (
                                <div
                                    key={card.titleKey}
                                    className="rounded-[2rem] bg-slate-900/40 border border-slate-700/80 p-8 shadow-sm hover:bg-slate-900/60 hover:border-slate-600 transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${card.iconWrapClass}`}>
                                            <span className={`material-icons ${card.iconClass}`}>{card.icon}</span>
                                        </div>
                                        <h3 className="text-xl font-extrabold text-white">{t(card.labelKey)}</h3>
                                    </div>

                                    <p className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight">
                                        {t(card.titleKey)}
                                    </p>
                                    <p className="text-slate-400 text-base sm:text-lg leading-relaxed">{t(card.descKey)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section className="py-24 bg-slate-900/50" id="pricing">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">{t('pricing.title')}</h2>
                            <p className="text-lg text-primary">{t('pricing.subtitle')}</p>
                        </div>

                        <div className="flex items-center justify-center gap-4 mb-6">
                            <span className={`font-medium ${!isYearly ? 'text-white' : 'text-slate-400'}`}>{t('pricing.monthly')}</span>
                            <button onClick={() => setIsYearly(!isYearly)} className="relative w-14 h-8 bg-primary rounded-full transition-colors">
                                <div className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform transform ${isYearly ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                            <span className={`font-medium ${isYearly ? 'text-white' : 'text-slate-400'}`}>{t('pricing.yearly')}</span>
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-md border border-green-500/30">
                                {t('pricing.savings')}
                            </span>
                        </div>

                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                                <span className="material-icons text-orange-500 text-sm">local_fire_department</span>
                                <span className="text-orange-500 font-semibold text-sm">
                                    {t('pricing.countdown', { pct: discountPercent, time: timeLeft })}
                                </span>
                            </div>
                        </div>

                        <div className="relative max-w-2xl mx-auto">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur-xl"></div>
                            <div className="relative bg-slate-900 border-2 border-primary/30 rounded-3xl p-8 shadow-2xl">
                                <div className="absolute -top-3 right-8">
                                    <span className="px-4 py-1.5 bg-green-500/20 text-green-400 text-sm font-bold rounded-full border border-green-500/30">
                                    -{discountPercent}%
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                                        <span className="material-icons text-white text-2xl">school</span>
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-white">{t('pricing.planTitle')}</h3>
                                </div>
                                <p className="text-slate-400 mb-6">{t('pricing.planDesc')}</p>
                                <div className="flex items-baseline gap-3 mb-6">
                                    <span className="text-slate-500 text-2xl sm:text-3xl font-bold line-through">{formatPriceFromUsd(currentPlan.originalPrice)}</span>
                                    <span className="text-white text-3xl sm:text-5xl font-extrabold">{formatPriceFromUsd(currentPlan.price)}</span>
                                    <span className="text-slate-400 text-base sm:text-lg">/ {t(`pricing.interval.${currentPlan.interval}`)}</span>
                                </div>
                                <button
                                    onClick={() => router.push(`/signup?plan=${isYearly ? 'yearly' : 'monthly'}`)}
                                    className="w-full py-5 bg-primary hover:bg-primary/90 text-white text-lg font-bold rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2 mb-6"
                                >
                                    {t('pricing.cta')}
                                    <span className="material-icons">arrow_forward</span>
                                </button>
                                <div className="flex items-center justify-center gap-2 mb-6 pb-6 border-b border-slate-700">
                                    <span className="text-white font-semibold">{t('pricing.trustpilot.excellent')}</span>
                                    <span className="text-slate-400">{t('pricing.trustpilot.rating')}</span>
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (<span key={i} className="material-icons text-green-500 text-sm">star</span>))}
                                    </div>
                                    <span className="text-slate-400">{t('pricing.trustpilot.name')}</span>
                                </div>
                                <div className="rounded-xl overflow-hidden bg-slate-800 p-2">
                                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop" alt="Platform preview" className="w-full h-auto rounded-lg" />
                                </div>
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
                                        <span className="material-icons text-primary text-sm">check_circle</span>
                                        <span className="font-semibold text-primary">{t('pricing.accessText')}</span>
                                        <span>{t('pricing.accessTo')}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 max-w-md mx-auto text-center">
                            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                                <h4 className="text-xl font-bold text-white mb-4">{t('pricing.otherApps.title')}</h4>
                                <div className="text-4xl font-extrabold text-white mb-4">{formatPriceFromUsd(1100)}+</div>
                                <p className="text-slate-400 mb-4">{t('pricing.otherApps.subtitle')}</p>
                                <ul className="space-y-2 text-sm text-slate-500">
                                    {['f1', 'f2', 'f3', 'f4'].map(k => (
                                        <li key={k} className="flex items-center gap-2">
                                            <span className="material-icons text-xs">check</span>
                                            {t(`pricing.otherApps.${k}`)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">{t('testimonials.title')}</h2>
                            <div className="flex justify-center gap-1 text-yellow-500">
                                {[...Array(5)].map((_, i) => (<span key={i} className="material-icons">star</span>))}
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {testimonials.map((item, i) => (
                                <div key={i} className="p-8 bg-slate-800/40 rounded-2xl border border-slate-700 shadow-sm relative">
                                    <span className="material-icons absolute top-8 right-8 text-slate-700 text-6xl">format_quote</span>
                                    <p className="text-slate-300 mb-8 relative z-10">{t(item.quoteKey)}</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                                            {t(item.nameKey)[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{t(item.nameKey)}</p>
                                            <p className="text-xs text-primary font-semibold uppercase">{t(item.roleKey)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="bg-gradient-primary rounded-[2rem] p-8 lg:p-20 relative overflow-hidden text-center text-white">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32"></div>
                            <h2 className="text-4xl lg:text-6xl font-extrabold mb-8 relative z-10">{t('cta.title')}</h2>
                            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto relative z-10">{t('cta.subtitle')}</p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
                                <button onClick={() => router.push('/signup')} className="bg-white text-primary px-12 py-5 rounded-xl font-extrabold text-lg shadow-2xl hover:bg-blue-50 transition-all">
                                    {t('cta.primary')}
                                </button>
                                <button className="bg-transparent border-2 border-white/30 text-white px-12 py-5 rounded-xl font-extrabold text-lg hover:bg-white/10 transition-all">
                                    {t('cta.secondary')}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Live Sales */}
                <LiveSalesSection />

                {/* Footer */}
                <footer className="bg-background-dark border-t border-slate-800 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-primary rounded flex items-center justify-center">
                                    <span className="material-icons text-white text-sm">rocket_launch</span>
                                </div>
                                <span className="text-lg font-bold text-white">SupplyPoint</span>
                            </div>
                            <div className="flex gap-8 text-sm font-semibold text-slate-500">
                                <a className="hover:text-primary transition-colors" href="#">{t('footer.privacy')}</a>  
                                <a className="hover:text-primary transition-colors" href="#">{t('footer.terms')}</a>
                                <a className="hover:text-primary transition-colors" href="#">{t('footer.contact')}</a>

                            </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-800/50 text-center text-slate-600 text-sm">
                            {t('footer.copyright')}
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
