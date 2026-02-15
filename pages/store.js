import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { CartProvider, useCart } from '../contexts/CartContext';

function Store() {
    const router = useRouter();
    const { ref } = router.query;
    const { addToCart, isInCart, getCartCount, setReferralCode } = useCart();
    const [showPopup, setShowPopup] = useState(false);
    const [addedProduct, setAddedProduct] = useState(null);

    // Save referral code when URL has ref parameter
    useEffect(() => {
        if (ref) {
            setReferralCode(ref);
        }
    }, [ref, setReferralCode]);

    const handleAddToCart = (product) => {
        if (!isInCart(product.id)) {
            addToCart(product);
            setAddedProduct(product);
            setShowPopup(true);
        }
    };

    const handleViewCart = () => {
        setShowPopup(false);
        router.push('/store/cart');
    };

    const handleCheckoutNow = () => {
        setShowPopup(false);
        router.push('/store/cart');
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

                {/* Cart Icon */}
                <div className="container mx-auto px-4 sm:px-6 py-3 md:py-4 max-w-5xl">
                    <div className="flex justify-end">
                        <button
                            onClick={() => router.push('/store/cart')}
                            className="relative bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl px-3 md:px-4 py-2 flex items-center gap-2 transition-all group"
                        >
                            <span className="material-icons text-[#9d34da] group-hover:scale-110 transition-transform text-xl md:text-2xl">shopping_cart</span>
                            <span className="text-white font-semibold text-sm md:text-base">{getCartCount()}</span>
                            {getCartCount() > 0 && (
                                <div className="absolute -top-1 -right-1 bg-[#9d34da] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {getCartCount()}
                                </div>
                            )}
                        </button>
                    </div>
                </div>

                {/* Added to Cart Popup */}
                {showPopup && addedProduct && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 md:p-6" onClick={() => setShowPopup(false)}>
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-icons text-green-500 text-4xl">check_circle</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Added to Cart!</h3>
                                <p className="text-gray-400">{addedProduct.title}</p>
                                <p className="text-[#9d34da] font-bold text-xl mt-2">{addedProduct.price}</p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleCheckoutNow}
                                    className="w-full py-4 bg-[#9d34da] hover:bg-[#8a2cc2] text-white font-bold rounded-xl transition-all transform hover:scale-[1.02]"
                                >
                                    Checkout Now
                                </button>
                                <button
                                    onClick={handleViewCart}
                                    className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all"
                                >
                                    View Cart
                                </button>
                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="w-full py-4 bg-transparent border border-zinc-700 hover:border-zinc-600 text-gray-400 hover:text-white font-bold rounded-xl transition-all"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-5xl">
                    {/* Hero Section */}
                    <div className="text-center mb-12 md:mb-16">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-4 md:mb-6 leading-tight">
                            Get Rich in 2026.<br />
                            <span className="text-[#9d34da]">Build Once.</span> Paid Forever.
                        </h1>
                        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 mb-6 md:mb-8 max-w-3xl mx-auto px-4">
                            The ultimate database of 500+ verified Vinted suppliers. Start sourcing premium products today.
                        </p>
                    </div>

                    {/* Products Section */}
                    <div className="mb-12 md:mb-16">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-3">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">Products</h2>
                            <div className="text-gray-400 text-sm">
                                <span className="font-semibold">8 products</span>
                            </div>
                        </div>

                        {/* Product Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {[
                                {
                                    id: 1,
                                    title: 'All Premium Suppliers Links Bundle',
                                    image: '',
                                    rating: 5,
                                    reviews: 13,
                                    price: '1.281,00 Kč',
                                    priceId: 'price_1QrnB8GfZEaA9RkQ5cWfKKyf', // Real price ID
                                    soldOut: false
                                },
                                {
                                    id: 2,
                                    title: 'All Regular Supplier Links Bundle',
                                    image: null,
                                    rating: 5,
                                    reviews: 11,
                                    price: '854,00 Kč',
                                    priceId: 'price_1QrnB8GfZEaA9RkQGdvLFSIE', // Real price ID
                                    soldOut: false
                                },
                                {
                                    id: 3,
                                    title: 'Branded Knitwear Mystery Box',
                                    image: null,
                                    rating: 5,
                                    reviews: 1,
                                    price: '570,00 Kč',
                                    priceId: 'price_PLACEHOLDER_3',
                                    soldOut: true
                                },
                                {
                                    id: 4,
                                    title: 'Branded Knitwear Suppliers',
                                    image: null,
                                    rating: 5,
                                    reviews: 4,
                                    price: '427,00 Kč',
                                    priceId: 'price_PLACEHOLDER_4',
                                    soldOut: false
                                },
                                {
                                    id: 5,
                                    title: 'Nike Clothing Suppliers',
                                    image: null,
                                    rating: 5,
                                    reviews: 7,
                                    price: '427,00 Kč',
                                    priceId: 'price_PLACEHOLDER_5',
                                    soldOut: false
                                },
                                {
                                    id: 6,
                                    title: 'Windbreaker Mystery Box',
                                    image: null,
                                    rating: 5,
                                    reviews: 2,
                                    price: '570,00 Kč',
                                    priceId: 'price_PLACEHOLDER_6',
                                    soldOut: true
                                },
                                {
                                    id: 7,
                                    title: 'Windbreaker Suppliers',
                                    image: null,
                                    rating: 5,
                                    reviews: 5,
                                    price: '427,00 Kč',
                                    priceId: 'price_PLACEHOLDER_7',
                                    soldOut: false
                                },
                                {
                                    id: 8,
                                    title: 'Burberry Scarfs Suppliers',
                                    image: null,
                                    rating: 5,
                                    reviews: 3,
                                    price: '284,00 Kč',
                                    priceId: 'price_PLACEHOLDER_8',
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
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.soldOut || isInCart(product.id)}
                                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${product.soldOut
                                                ? 'bg-zinc-800 text-gray-500 cursor-not-allowed'
                                                : isInCart(product.id)
                                                    ? 'bg-zinc-700 text-gray-400 cursor-not-allowed'
                                                    : 'bg-[#9d34da] hover:bg-[#8a2cc2] text-white transform hover:scale-[1.02]'
                                                }`}
                                        >
                                            {product.soldOut ? 'SOLD OUT' : isInCart(product.id) ? 'IN CART' : 'ADD TO CART'}
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
                    <div className="mb-12 md:mb-16">
                        <h3 className="text-2xl sm:text-3xl font-black text-white text-center mb-8 md:mb-10">
                            Why Choose Our Database?
                        </h3>
                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
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

export default function StoreWithCart() {
    return (
        <CartProvider>
            <Store />
        </CartProvider>
    );
}
