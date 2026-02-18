import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { loadStripe } from '@stripe/stripe-js';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Pricing() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isYearly, setIsYearly] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');
    const { t } = useLanguage();

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
        monthly: {
            price: 29,
            originalPrice: 42,
            priceId: 'price_1T0ekuK0Js68kvLkMYhxx8CM',
            interval: 'month',
        },
        yearly: {
            price: 290,
            originalPrice: 414,
            priceId: 'price_1T0elcK0Js68kvLk6VSn2qZi',
            interval: 'year',
        }
    };

    const currentPlan = isYearly ? pricingConfig.yearly : pricingConfig.monthly;
    const discountPercent = Math.round(((currentPlan.originalPrice - currentPlan.price) / currentPlan.originalPrice) * 100);

    const handleSubscribe = async (plan) => {
        if (!user) {
            router.push('/signup?plan=' + plan.id);
            return;
        }

        setLoading(true);
        setSelectedPlan(plan.id);

        try {
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid, priceId: plan.priceId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL received');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Nepodařilo se vytvořit předplatné. Zkuste to prosím znovu.');
            setLoading(false);
            setSelectedPlan(null);
        }
    };

    return (
        <>
            <Head>
                <title>{t('pricing.pageTitle')}</title>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background-dark">
                {/* Navigation */}
                <nav className="bg-surface-dark shadow-xl border-b border-slate-700">
                    <div className="container mx-auto px-4 sm:px-6 py-3 md:py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                                    <span className="material-icons text-white text-xl md:text-2xl">rocket_launch</span>
                                </div>
                                <h1 className="text-lg md:text-xl font-bold text-white">
                                    Supplier<span className="text-primary">SaaS</span>
                                </h1>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4">
                                <LanguageToggle />
                                {user ? (
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="text-primary hover:text-primary/80 font-semibold text-xs md:text-sm transition-colors"
                                    >
                                        {t('nav.dashboard')}
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => router.push('/login')}
                                            className="text-slate-300 hover:text-white font-semibold text-xs md:text-sm transition-colors"
                                        >
                                            {t('nav.login')}
                                        </button>
                                        <button
                                            onClick={() => router.push('/signup')}
                                            className="bg-gradient-primary text-white px-3 md:px-6 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
                                        >
                                            {t('nav.signup')}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Pricing Section */}
                <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
                            {t('pricing.title')}
                        </h2>
                        <p className="text-lg text-primary">
                            {t('pricing.subtitle')}
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <span className={`font-medium ${!isYearly ? 'text-white' : 'text-slate-400'}`}>{t('pricing.monthly')}</span>
                        <button
                            onClick={() => setIsYearly(!isYearly)}
                            className="relative w-14 h-8 bg-primary rounded-full transition-colors"
                        >
                            <div className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform transform ${isYearly ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                        <span className={`font-medium ${isYearly ? 'text-white' : 'text-slate-400'}`}>{t('pricing.yearly')}</span>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded-md border border-green-500/30">
                            {t('pricing.savings')}
                        </span>
                    </div>

                    {/* Countdown */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                            <span className="material-icons text-orange-500 text-sm">local_fire_department</span>
                            <span className="text-orange-500 font-semibold text-sm">
                                {t('pricing.countdown', { pct: discountPercent, time: timeLeft })}
                            </span>
                        </div>
                    </div>

                    {/* Single Pricing Card */}
                    <div className="relative max-w-2xl mx-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur-xl"></div>
                        <div className="relative bg-slate-900 border-2 border-primary/30 rounded-3xl p-8 shadow-2xl">
                            <div className="absolute -top-3 right-8">
                                <span className="px-4 py-1.5 bg-green-500/20 text-green-400 text-sm font-bold rounded-full border border-green-500/30">
                                    {t('pricing.badge')}
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
                                <span className="text-slate-500 text-3xl font-bold line-through">${currentPlan.originalPrice}</span>
                                <span className="text-white text-5xl font-extrabold">${currentPlan.price}</span>
                                <span className="text-slate-400 text-lg">/ {currentPlan.interval}</span>
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-sm font-bold rounded">
                                    -{discountPercent}%
                                </span>
                            </div>

                            <button
                                onClick={() => handleSubscribe({ id: isYearly ? 'yearly' : 'monthly', priceId: currentPlan.priceId })}
                                disabled={loading}
                                className="w-full py-5 bg-primary hover:bg-primary/90 text-white text-lg font-bold rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center justify-center gap-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading && selectedPlan === (isYearly ? 'yearly' : 'monthly') ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="material-icons animate-spin">refresh</span>
                                        {t('pricing.cta')}...
                                    </span>
                                ) : (
                                    <>
                                        {t('pricing.cta')}
                                        <span className="material-icons">arrow_forward</span>
                                    </>
                                )}
                            </button>

                            <div className="flex items-center justify-center gap-2 mb-6 pb-6 border-b border-slate-700">
                                <span className="text-white font-semibold">{t('pricing.trustpilot.excellent')}</span>
                                <span className="text-slate-400">{t('pricing.trustpilot.rating')}</span>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="material-icons text-green-500 text-sm">star</span>
                                    ))}
                                </div>
                                <span className="text-slate-400">{t('pricing.trustpilot.name')}</span>
                            </div>

                            <div className="rounded-xl overflow-hidden bg-slate-800 p-2">
                                <img
                                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop"
                                    alt="Platform preview"
                                    className="w-full h-auto rounded-lg"
                                />
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

                    {/* Other apps comparison */}
                    <div className="mt-12 max-w-md mx-auto text-center">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
                            <h4 className="text-xl font-bold text-white mb-4">{t('pricing.otherApps.title')}</h4>
                            <div className="text-4xl font-extrabold text-white mb-4">{t('pricing.otherApps.price')}</div>
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

                    {/* Features Section */}
                    <div className="mt-16 md:mt-20 max-w-5xl mx-auto">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 md:mb-12">
                            {t('pricing.whyTitle')}
                        </h3>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                            {[
                                { icon: 'attach_money', titleKey: 'pricing.feature1.title', descKey: 'pricing.feature1.desc' },
                                { icon: 'analytics', titleKey: 'pricing.feature2.title', descKey: 'pricing.feature2.desc' },
                                { icon: 'support_agent', titleKey: 'pricing.feature3.title', descKey: 'pricing.feature3.desc' },
                            ].map((f, i) => (
                                <div key={i} className="text-center">
                                    <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                                        <span className="material-icons text-white text-3xl">{f.icon}</span>
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-2">{t(f.titleKey)}</h4>
                                    <p className="text-slate-400">{t(f.descKey)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
