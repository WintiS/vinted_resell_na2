import { useRouter } from 'next/router';
import { CartProvider, useCart } from '../../contexts/CartContext';
import Head from 'next/head';
import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

function Cart() {
    const router = useRouter();
    const { cart, removeFromCart, getCartTotal, clearCart, addToCart, isInCart, referralCode } = useCart();
    const [loading, setLoading] = useState(false);
    const { t } = useLanguage();

    const allProducts = [
        { id: 1, title: 'All Premium Suppliers Links Bundle', price: '1.281,00 Kč', priceId: 'price_1QrnB8GfZEaA9RkQ5cWfKKyf' },
        { id: 2, title: 'All Regular Supplier Links Bundle', price: '854,00 Kč', priceId: 'price_1QrnB8GfZEaA9RkQGdvLFSIE' },
        { id: 3, title: 'Branded Knitwear Mystery Box', price: '570,00 Kč', priceId: 'price_PLACEHOLDER_3' },
        { id: 4, title: 'Branded Knitwear Suppliers', price: '427,00 Kč', priceId: 'price_PLACEHOLDER_4' },
        { id: 5, title: 'Nike Clothing Suppliers', price: '427,00 Kč', priceId: 'price_PLACEHOLDER_5' },
        { id: 6, title: 'Windbreaker Mystery Box', price: '570,00 Kč', priceId: 'price_PLACEHOLDER_6' },
        { id: 7, title: 'Windbreaker Suppliers', price: '427,00 Kč', priceId: 'price_PLACEHOLDER_7' },
        { id: 8, title: 'Burberry Scarfs Suppliers', price: '284,00 Kč', priceId: 'price_PLACEHOLDER_8' },
    ];

    const suggestedProduct = allProducts.find(p => !isInCart(p.id));

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        setLoading(true);
        try {
            const response = await fetch('/api/store-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart, referralCode: referralCode || '' })
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert(t('cart.checkoutError'));
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>{t('cart.pageTitle')}</title>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-black">
                <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-6xl">
                    {/* Header */}
                    <div className="mb-8 md:mb-12">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <button
                                onClick={() => router.push('/store')}
                                className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                            >
                                <span className="material-icons text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                {t('cart.backToStore')}
                            </button>
                            <LanguageToggle variant="store" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">{t('cart.title')}</h1>
                    </div>

                    {cart.length === 0 ? (
                        <div className="text-center py-12 md:py-16">
                            <span className="material-icons text-gray-600 text-7xl md:text-9xl mb-4 md:mb-6">shopping_cart</span>
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">{t('cart.empty.title')}</h2>
                            <p className="text-gray-400 mb-6 md:mb-8 text-sm md:text-base">{t('cart.empty.desc')}</p>
                            <button
                                onClick={() => router.push('/store')}
                                className="bg-[#9d34da] hover:bg-[#8a2cc2] text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-xl transition-all transform hover:scale-[1.02]"
                            >
                                {t('cart.empty.btn')}
                            </button>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4 md:space-y-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                                        <div className="w-full sm:w-24 h-24 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="material-icons text-gray-600 text-4xl">inventory_2</span>
                                        </div>
                                        <div className="flex-grow w-full sm:w-auto">
                                            <h3 className="text-white font-bold text-base md:text-lg mb-2">{item.title}</h3>
                                            <p className="text-[#9d34da] font-bold text-lg md:text-xl">{item.price}</p>
                                            <p className="text-gray-400 text-xs md:text-sm mt-1">{t('cart.quantity', { qty: item.quantity })}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-2 self-end sm:self-auto"
                                        >
                                            <span className="material-icons">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-6">
                                    <h2 className="text-2xl font-bold text-white mb-6">{t('cart.orderSummary')}</h2>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-gray-400">
                                            <span>{t('cart.subtotal')}</span>
                                            <span>{getCartTotal().toFixed(2)} Kč</span>
                                        </div>
                                        <div className="border-t border-zinc-800 pt-4">
                                            <div className="flex justify-between text-white font-bold text-xl">
                                                <span>{t('cart.total')}</span>
                                                <span>{getCartTotal().toFixed(2)} Kč</span>
                                            </div>
                                        </div>
                                    </div>

                                    {referralCode && (
                                        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center">
                                            <p className="text-xs text-yellow-400 flex items-center justify-center gap-2">
                                                <span className="material-icons text-sm">celebration</span>
                                                {t('cart.referral')} <span className="font-mono font-bold">{referralCode}</span>
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleCheckout}
                                        disabled={loading}
                                        className="w-full bg-[#9d34da] hover:bg-[#8a2cc2] text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                                    >
                                        {loading ? t('cart.processing') : t('cart.checkout')}
                                    </button>

                                    <button
                                        onClick={() => router.push('/store')}
                                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all"
                                    >
                                        {t('cart.continueShopping')}
                                    </button>

                                    <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="material-icons text-[#9d34da]">verified_user</span>
                                            <span className="text-gray-400">{t('cart.trust.secure')}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="material-icons text-[#9d34da]">lock</span>
                                            <span className="text-gray-400">{t('cart.trust.ssl')}</span>
                                        </div>
                                    </div>
                                </div>

                                {suggestedProduct && (
                                    <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-4">{t('cart.youMightLike')}</h3>
                                        <div className="space-y-4">
                                            <div className="bg-black rounded-xl p-4">
                                                <div className="w-full aspect-square bg-zinc-900 rounded-lg flex items-center justify-center mb-3">
                                                    <span className="material-icons text-gray-600 text-5xl">inventory_2</span>
                                                </div>
                                                <h4 className="text-white font-semibold mb-2 text-sm">{suggestedProduct.title}</h4>
                                                <p className="text-[#9d34da] font-bold mb-3">{suggestedProduct.price}</p>
                                                <button
                                                    onClick={() => addToCart(suggestedProduct)}
                                                    className="w-full bg-[#9d34da] hover:bg-[#8a2cc2] text-white font-bold py-2 rounded-lg text-sm transition-all"
                                                >
                                                    {t('cart.addToCart')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default function CartWithProvider() {
    return (
        <CartProvider>
            <Cart />
        </CartProvider>
    );
}
