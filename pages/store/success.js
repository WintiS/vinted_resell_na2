import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { CartProvider, useCart } from '../../contexts/CartContext';
import Head from 'next/head';

function SuccessPage() {
    const router = useRouter();
    const { session_id } = router.query;
    const { clearCart } = useCart();

    useEffect(() => {
        // Clear cart on successful purchase
        clearCart();
    }, []);

    return (
        <>
            <Head>
                <title>Order Successful | VintedResells</title>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
                    {/* Success Icon */}
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-icons text-green-500 text-7xl">check_circle</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Order Successful!
                    </h1>

                    {/* Message */}
                    <p className="text-xl text-gray-400 mb-8">
                        Thank you for your purchase! Your order has been confirmed.
                    </p>

                    {session_id && (
                        <div className="bg-black border border-zinc-800 rounded-xl p-4 mb-8">
                            <p className="text-sm text-gray-500 mb-1">Order ID</p>
                            <p className="text-white font-mono text-sm break-all">{session_id}</p>
                        </div>
                    )}

                    {/* Next Steps */}
                    <div className="bg-black border border-zinc-800 rounded-xl p-6 mb-8 text-left">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-icons text-[#9d34da]">info</span>
                            What's Next?
                        </h2>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-start gap-3">
                                <span className="material-icons text-[#9d34da] text-xl">email</span>
                                <span>You'll receive a confirmation email with your order details</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-icons text-[#9d34da] text-xl">download</span>
                                <span>Access your purchased products from your dashboard</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-icons text-[#9d34da] text-xl">support</span>
                                <span>Contact support if you need any assistance</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="w-full bg-[#9d34da] hover:bg-[#8a2cc2] text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02]"
                        >
                            Go to Dashboard
                        </button>
                        <button
                            onClick={() => router.push('/store')}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all"
                        >
                            Continue Shopping
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-transparent border border-zinc-700 hover:border-zinc-600 text-gray-400 hover:text-white font-bold py-4 rounded-xl transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default function Success() {
    return (
        <CartProvider>
            <SuccessPage />
        </CartProvider>
    );
}
