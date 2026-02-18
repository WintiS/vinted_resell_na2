import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { CartProvider, useCart } from '../../contexts/CartContext';
import Head from 'next/head';
import { useLanguage } from '../../context/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

function SuccessPage() {
    const router = useRouter();
    const { session_id } = router.query;
    const { clearCart } = useCart();
    const { t } = useLanguage();

    useEffect(() => {
        clearCart();
    }, []);

    return (
        <>
            <Head>
                <title>{t('storeSuccess.pageTitle')}</title>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-black flex items-center justify-center p-6 relative">
                {/* Language toggle */}
                <div className="absolute top-4 right-4">
                    <LanguageToggle variant="store" />
                </div>

                <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-icons text-green-500 text-7xl">check_circle</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        {t('storeSuccess.title')}
                    </h1>

                    <p className="text-xl text-gray-400 mb-8">
                        {t('storeSuccess.desc')}
                    </p>

                    {session_id && (
                        <div className="bg-black border border-zinc-800 rounded-xl p-4 mb-8">
                            <p className="text-sm text-gray-500 mb-1">{t('storeSuccess.orderId')}</p>
                            <p className="text-white font-mono text-sm break-all">{session_id}</p>
                        </div>
                    )}

                    <div className="bg-black border border-zinc-800 rounded-xl p-6 mb-8 text-left">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-icons text-[#9d34da]">info</span>
                            {t('storeSuccess.whatsNext')}
                        </h2>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-start gap-3">
                                <span className="material-icons text-[#9d34da] text-xl">email</span>
                                <span>{t('storeSuccess.next1')}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-icons text-[#9d34da] text-xl">download</span>
                                <span>{t('storeSuccess.next2')}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-icons text-[#9d34da] text-xl">support</span>
                                <span>{t('storeSuccess.next3')}</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/store')}
                            className="w-full bg-[#9d34da] hover:bg-[#8a2cc2] text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02]"
                        >
                            {t('storeSuccess.toDashboard')}
                        </button>
                        <button
                            onClick={() => router.push('/store')}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all"
                        >
                            {t('storeSuccess.continueShopping')}
                        </button>
                        <button
                            onClick={() => router.push('/store')}
                            className="w-full bg-transparent border border-zinc-700 hover:border-zinc-600 text-gray-400 hover:text-white font-bold py-4 rounded-xl transition-all"
                        >
                            {t('storeSuccess.backToHome')}
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
