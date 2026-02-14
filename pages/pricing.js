import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Pricing() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const plans = [
        {
            id: 'monthly',
            name: 'Měsíční',
            price: 29,
            interval: 'měsíc',
            priceId: 'price_1T0SmWKGkcJogUXoQe8fxHV3',
            features: [
                'Unikátní affiliátní odkaz',
                '100% provize z prodejů',
                'Analytika v reálném čase',
                'E-mailová podpora',
                'Zrušení kdykoliv'
            ]
        },
        {
            id: 'yearly',
            name: 'Roční',
            price: 290,
            interval: 'rok',
            priceId: 'price_1T0SnHKGkcJogUXoqgxL79bC',
            savings: '17%',
            badge: 'NEJLEPŠÍ HODNOTA',
            features: [
                'Vše z měsíčního plánu',
                '2 měsíce zdarma',
                'Prioritní podpora',
                'Přednostní přístup k novinkám',
                'Čtvrtletní konzultace'
            ]
        }
    ];

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
                body: JSON.stringify({
                    userId: user.uid,
                    priceId: plan.priceId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            // Redirect to Stripe Checkout using the URL directly
            // This is the modern approach (redirectToCheckout is deprecated)
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
        // Note: Don't reset loading state on success - user will be redirected
    };

    return (
        <>
            <Head>
                <title>Ceník | SupplierSaaS</title>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background-dark">
                {/* Navigation */}
                <nav className="bg-surface-dark shadow-xl border-b border-slate-700">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                                <span className="material-icons text-white">rocket_launch</span>
                            </div>
                            <h1 className="text-xl font-bold text-white">
                                Supplier<span className="text-primary">SaaS</span>
                            </h1>
                        </div>
                        <div className="flex gap-4">
                            {user ? (
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="text-primary hover:text-primary/80 font-semibold transition-colors"
                                >
                                    Přehled
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => router.push('/login')}
                                        className="text-slate-300 hover:text-white font-semibold transition-colors"
                                    >
                                        Přihlásit se
                                    </button>
                                    <button
                                        onClick={() => router.push('/signup')}
                                        className="bg-gradient-primary text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
                                    >
                                        Registrace
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </nav>

                {/* Pricing Section */}
                <div className="container mx-auto px-6 py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-5xl font-bold text-white mb-4">
                            Vyberte si svůj plán
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Začněte vydělávat 100% provizi z každého prodeje. Zrušit kdykoliv.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`bg-surface-dark rounded-2xl shadow-2xl p-8 border-2 ${plan.badge
                                    ? 'border-primary relative'
                                    : 'border-slate-700'
                                    }`}
                            >
                                {plan.badge && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-primary text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                                        {plan.badge}
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center gap-2">
                                        <span className="text-5xl font-bold text-white">${plan.price}</span>
                                        <span className="text-slate-400">/{plan.interval}</span>
                                    </div>
                                    {plan.savings && (
                                        <p className="text-green-400 font-semibold mt-2">Ušetříte {plan.savings}</p>
                                    )}
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <span className="material-icons text-green-500 text-xl">check_circle</span>
                                            <span className="text-slate-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSubscribe(plan)}
                                    disabled={loading}
                                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${plan.badge
                                        ? 'bg-gradient-primary text-white hover:shadow-lg hover:shadow-primary/30'
                                        : 'bg-slate-700 text-white hover:bg-slate-600'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {loading && selectedPlan === plan.id ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="material-icons animate-spin">refresh</span>
                                            Zpracovává se...
                                        </span>
                                    ) : (
                                        'Předplatit nyní'
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Features Section */}
                    <div className="mt-20 max-w-5xl mx-auto">
                        <h3 className="text-3xl font-bold text-white text-center mb-12">
                            Proč si vybrat SupplierSaaS?
                        </h3>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <span className="material-icons text-white text-3xl">attach_money</span>
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">100% Provize</h4>
                                <p className="text-slate-400">
                                    Zachováte si každou korunu, kterou vyděláte. Žádné skryté poplatky.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <span className="material-icons text-white text-3xl">analytics</span>
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">Analytika v reálném čase</h4>
                                <p className="text-slate-400">
                                    Sledujte své prodeje, příjmy a výkon v reálném čase.
                                </p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <span className="material-icons text-white text-3xl">support_agent</span>
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">Dedikovaná podpora</h4>
                                <p className="text-slate-400">
                                    Získejte pomoc, když ji potřebujete, s naším responzivním týmem.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
