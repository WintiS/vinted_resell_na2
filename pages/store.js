import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
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
                <title>Premium Vinted Suppliers Database | VintedResells</title>
                <meta name="description" content="Get access to 500+ verified Vinted suppliers. The ultimate resource for Vinted resellers." />
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
                <style>{`
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .animate-marquee {
                        animation: marquee 20s linear infinite;
                    }
                `}</style>
            </Head>

            <div className="min-h-screen bg-black">
                {/* Announcement Banner */}
                <div className="w-full overflow-hidden bg-[#9d34da] py-3">
                    <div className="flex whitespace-nowrap">
                        <div className="animate-marquee inline-block">
                            <span className="text-white font-semibold text-sm mx-8">✨ 100% VERIFIED SUPPLIERS</span>
                            <span className="text-white font-semibold text-sm mx-8">🚀 LIFETIME ACCESS</span>
                            <span className="text-white font-semibold text-sm mx-8">💎 500+ PREMIUM CONTACTS</span>
                            <span className="text-white font-semibold text-sm mx-8">📈 UPDATED MONTHLY</span>
                            <span className="text-white font-semibold text-sm mx-8">✨ 100% VERIFIED SUPPLIERS</span>
                            <span className="text-white font-semibold text-sm mx-8">🚀 LIFETIME ACCESS</span>
                            <span className="text-white font-semibold text-sm mx-8">💎 500+ PREMIUM CONTACTS</span>
                            <span className="text-white font-semibold text-sm mx-8">📈 UPDATED MONTHLY</span>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-6 py-16 max-w-5xl">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                            Get Rich in 2026.<br />
                            <span className="text-[#9d34da]">Build Once.</span> Paid Forever.
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-3xl mx-auto">
                            The ultimate database of 500+ verified Vinted suppliers. Start sourcing premium products today.
                        </p>
                    </div>

                    {/* Products Section */}
                    <div className="mb-16">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-black text-white">Products</h2>
                            <div className="text-gray-400 text-sm">
                                <span className="font-semibold">8 products</span>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    id: 1,
                                    title: 'All Premium Suppliers Links Bundle',
                                    image: '',
                                    rating: 5,
                                    reviews: 13,
                                    price: '1.281,00 Kč',
                                    soldOut: false
                                },
                                {
                                    id: 2,
                                    title: 'All Regular Supplier Links Bundle',
                                    image: null,
                                    rating: 5,
                                    reviews: 11,
                                    price: '854,00 Kč',
                                    soldOut: false
                                },
                                {
                                    id: 3,
                                    title: 'Branded Knitwear Mystery Box',
                                    image: null,
                                    rating: 5,
                                    reviews: 1,
                                    price: '570,00 Kč',
                                    soldOut: true
                                },
                                {
                                    id: 4,
                                    title: 'Branded Knitwear Suppliers',
                                    image: null,
                                    rating: 5,
                                    reviews: 4,
                                    price: '427,00 Kč',
                                    soldOut: false
                                },
                                {
                                    id: 5,
                                    title: 'Nike Clothing Suppliers',
                                    image: null,
                                    rating: 5,
                                    reviews: 7,
                                    price: '427,00 Kč',
                                    soldOut: false
                                },
                                {
                                    id: 6,
                                    title: 'Windbreaker Mystery Box',
                                    image: null,
                                    rating: 5,
                                    reviews: 2,
                                    price: '570,00 Kč',
                                    soldOut: true
                                },
                                {
                                    id: 7,
                                    title: 'Windbreaker Suppliers',
                                    image: null,
                                    rating: 5,
                                    reviews: 5,
                                    price: '427,00 Kč',
                                    soldOut: false
                                },
                                {
                                    id: 8,
                                    title: 'Burberry Scarfs Suppliers',
                                    image: null,
                                    rating: 5,
                                    reviews: 3,
                                    price: '284,00 Kč',
                                    soldOut: false
                                }
                            ].map((product) => (
                                <div key={product.id} className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all">
                                    {/* Product Image */}
                                    <div className="relative aspect-square bg-black p-6 flex items-center justify-center">
                                        {product.image ? (
                                            <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-gray-600 text-center">
                                                <span className="material-icons text-6xl mb-2">inventory_2</span>
                                                <p className="text-sm">{product.title}</p>
                                            </div>
                                        )}
                                        {product.soldOut && (
                                            <div className="absolute top-3 right-3 bg-[#9d34da] text-white px-3 py-1 rounded-lg text-xs font-bold">
                                                Sold out
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="p-5">
                                        <h3 className="font-bold text-white text-lg mb-3 min-h-[56px]">
                                            {product.title}
                                        </h3>

                                        {/* Rating */}
                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className="text-yellow-400 text-sm">★</span>
                                            ))}
                                            <span className="text-gray-400 text-sm ml-1">({product.reviews})</span>
                                        </div>

                                        {/* Price */}
                                        <p className="text-white font-bold text-xl mb-4">{product.price}</p>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={() => handlePurchase()}
                                            disabled={product.soldOut || loading}
                                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${product.soldOut
                                                ? 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                                                : 'bg-[#9d34da] hover:bg-[#8a2cc2] text-white transform hover:scale-[1.02]'
                                                }`}
                                        >
                                            {product.soldOut ? 'SOLD OUT' : 'ADD TO CART'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {ref && (
                            <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                                <p className="text-sm text-yellow-400 flex items-center justify-center gap-2">
                                    <span className="material-icons text-lg">celebration</span>
                                    Referral code applied: <span className="font-mono font-bold">{ref}</span>
                                </p>
                            </div>
                        )}
                    </div>


                    {/* Why Choose Section */}
                    <div className="mb-16">
                        <h3 className="text-3xl font-black text-white text-center mb-10">
                            Why Choose Our Database?
                        </h3>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    emoji: '🎯',
                                    title: 'Curated Quality',
                                    description: 'Every supplier is manually verified for reliability and product quality'
                                },
                                {
                                    emoji: '💼',
                                    title: 'Business Ready',
                                    description: 'Start sourcing premium products within minutes of purchase'
                                },
                                {
                                    emoji: '📈',
                                    title: 'Grow Faster',
                                    description: 'Scale your Vinted reselling business with confidence'
                                }
                            ].map((item, i) => (
                                <div key={i} className="text-center bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
                                    <div className="text-6xl mb-4">{item.emoji}</div>
                                    <h4 className="font-bold text-white text-xl mb-3">{item.title}</h4>
                                    <p className="text-gray-400">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                        <div className="flex flex-wrap justify-center gap-8">
                            <div className="flex items-center gap-3">
                                <span className="material-icons text-[#9d34da] text-3xl">verified_user</span>
                                <div>
                                    <p className="text-white font-bold">Secure Payment</p>
                                    <p className="text-gray-500 text-sm">Stripe Protected</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-icons text-[#9d34da] text-3xl">lock</span>
                                <div>
                                    <p className="text-white font-bold">SSL Encrypted</p>
                                    <p className="text-gray-500 text-sm">256-bit Security</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="material-icons text-[#9d34da] text-3xl">currency_exchange</span>
                                <div>
                                    <p className="text-white font-bold">30-Day Guarantee</p>
                                    <p className="text-gray-500 text-sm">No Questions Asked</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-12">
                        <button
                            onClick={() => router.push('/')}
                            className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-2 mx-auto group"
                        >
                            <span className="material-icons text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
