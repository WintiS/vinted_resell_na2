import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Cancel() {
    const router = useRouter();

    return (
        <>
            <Head>
                <title>Checkout Cancelled | VintedResells</title>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
                    {/* Cancel Icon */}
                    <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-icons text-yellow-500 text-7xl">cancel</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Checkout Cancelled
                    </h1>

                    {/* Message */}
                    <p className="text-xl text-gray-400 mb-8">
                        No worries! Your cart items have been saved and you can complete your purchase whenever you're ready.
                    </p>

                    {/* Info Box */}
                    <div className="bg-black border border-zinc-800 rounded-xl p-6 mb-8 text-left">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-icons text-[#9d34da]">info</span>
                            What Happened?
                        </h2>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-start gap-3">
                                <span className="material-icons text-[#9d34da] text-xl">shopping_cart</span>
                                <span>Your cart items are safe and haven't been removed</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-icons text-[#9d34da] text-xl">block</span>
                                <span>No payment was processed</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-icons text-[#9d34da] text-xl">schedule</span>
                                <span>You can return to complete your purchase anytime</span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/store/cart')}
                            className="w-full bg-[#9d34da] hover:bg-[#8a2cc2] text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02]"
                        >
                            Return to Cart
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
