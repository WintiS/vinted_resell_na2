import { useRouter } from 'next/router';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Head from 'next/head';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Store() {
    const router = useRouter();
    const { ref } = router.query;
    const [loading, setLoading] = useState(false);

    const handlePurchase = async () => {
        setLoading(true);

        try {
            const stripe = await stripePromise;

            const response = await fetch('/api/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: 'vinted-suppliers-list',
                    referralCode: ref || ''
                })
            });

            const { sessionId } = await response.json();
            await stripe.redirectToCheckout({ sessionId });
        } catch (error) {
            console.error('Purchase error:', error);
            alert('Purchase failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Premium Vinted Suppliers Database | SupplierSaaS</title>
                <meta name="description" content="Get access to 500+ verified Vinted suppliers. The ultimate resource for Vinted resellers." />
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background-dark py-12">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="bg-surface-dark rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
                        <div className="bg-gradient-primary p-8 text-white">
                            <h1 className="text-4xl font-bold mb-2">Premium Vinted Suppliers Database</h1>
                            <p className="text-xl opacity-90">
                                The Ultimate Resource for Vinted Resellers
                            </p>
                        </div>

                        <div className="p-8">
                            <div className="mb-8">
                                <h2 className="text-2xl font-semibold text-white mb-4">What You'll Get:</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        {
                                            title: '500+ Verified Suppliers',
                                            description: 'Handpicked and quality-checked',
                                            icon: 'verified'
                                        },
                                        {
                                            title: 'Complete Contact Info',
                                            description: 'Email, phone, and website',
                                            icon: 'contacts'
                                        },
                                        {
                                            title: 'Product Categories',
                                            description: 'Fashion, accessories, vintage & more',
                                            icon: 'category'
                                        },
                                        {
                                            title: 'Lifetime Updates',
                                            description: 'New suppliers added monthly',
                                            icon: 'update'
                                        },
                                        {
                                            title: 'Instant Access',
                                            description: 'Download immediately after purchase',
                                            icon: 'download'
                                        },
                                        {
                                            title: 'Money-Back Guarantee',
                                            description: '30 days, no questions asked',
                                            icon: 'verified_user'
                                        }
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-start space-x-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                            <div className="text-green-500">
                                                <span className="material-icons">{feature.icon}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{feature.title}</h3>
                                                <p className="text-sm text-slate-400">{feature.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-primary/30 p-8 rounded-xl mb-8">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div>
                                        <p className="text-slate-400 text-sm mb-1">One-Time Payment</p>
                                        <p className="text-5xl font-bold text-white mb-1">$49.99</p>
                                        <p className="text-sm text-slate-400">Lifetime access • No recurring fees</p>
                                    </div>
                                    <button
                                        onClick={handlePurchase}
                                        disabled={loading}
                                        className="bg-gradient-primary text-white px-10 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transform transition hover:scale-105"
                                    >
                                        {loading ? 'Processing...' : 'Get Instant Access'}
                                    </button>
                                </div>
                            </div>

                            {ref && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center mb-8">
                                    <p className="text-sm text-yellow-400 flex items-center justify-center gap-2">
                                        <span className="material-icons text-lg">celebration</span>
                                        You're purchasing through referral code: <span className="font-mono font-bold">{ref}</span>
                                    </p>
                                </div>
                            )}

                            <div className="mt-8 pt-8 border-t border-slate-700">
                                <h3 className="font-semibold text-white mb-6 text-center text-xl">Why Choose Our Database?</h3>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {[
                                        {
                                            emoji: '🎯',
                                            title: 'Curated Quality',
                                            description: 'Every supplier manually verified for reliability'
                                        },
                                        {
                                            emoji: '💼',
                                            title: 'Business Ready',
                                            description: 'Start sourcing products within minutes'
                                        },
                                        {
                                            emoji: '📈',
                                            title: 'Grow Faster',
                                            description: 'Scale your Vinted business with confidence'
                                        }
                                    ].map((item, i) => (
                                        <div key={i} className="text-center p-6 rounded-xl bg-slate-800/30 border border-slate-700">
                                            <div className="text-4xl mb-2">{item.emoji}</div>
                                            <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                                            <p className="text-sm text-slate-400">{item.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="mt-8 pt-8 border-t border-slate-700">
                                <div className="flex flex-wrap justify-center gap-6 text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <span className="material-icons text-green-500">verified_user</span>
                                        <span className="text-sm">Secure Payment</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-icons text-blue-500">lock</span>
                                        <span className="text-sm">SSL Encrypted</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-icons text-yellow-500">currency_exchange</span>
                                        <span className="text-sm">30-Day Guarantee</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-8">
                        <button
                            onClick={() => router.push('/')}
                            className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1 mx-auto"
                        >
                            <span className="material-icons text-sm">arrow_back</span>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
