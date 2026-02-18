import { useRouter } from 'next/router';
import Head from 'next/head';
import { useLanguage } from '../../context/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function Cancel() {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <>
            <Head>
                <title>{t('storeCancel.pageTitle')}</title>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-black flex items-center justify-center p-6 relative">
                {/* Language toggle */}
                <div className="absolute top-4 right-4">
                    <LanguageToggle variant="store" />
                </div>

                <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
                    <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="material-icons text-yellow-500 text-7xl">cancel</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        {t('storeCancel.title')}
                    </h1>

                    <p className="text-xl text-gray-400 mb-8">
                        {t('storeCancel.desc')}
                    </p>

                    <div className="bg-black border border-zinc-800 rounded-xl p-6 mb-8 text-left">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <span className="material-icons text-[#9d34da]">info</span>
                            {t('storeCancel.whatHappened')}
                        </h2>
                        <ul className="space-y-3 text-gray-400">
                            <li className="flex items-start gap-3">
                                <span className="material-icons text-[#9d34da] text-xl">shopping_cart</span>
                                <span>{t('storeCancel.info1')}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-icons text-[#9d34da] text-xl">block</span>
                                <span>{t('storeCancel.info2')}</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="material-icons text-[#9d34da] text-xl">schedule</span>
                                <span>{t('storeCancel.info3')}</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/store/cart')}
                            className="w-full bg-[#9d34da] hover:bg-[#8a2cc2] text-white font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02]"
                        >
                            {t('storeCancel.returnToCart')}
                        </button>
                        <button
                            onClick={() => router.push('/store')}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-4 rounded-xl transition-all"
                        >
                            {t('storeCancel.continueShopping')}
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full bg-transparent border border-zinc-700 hover:border-zinc-600 text-gray-400 hover:text-white font-bold py-4 rounded-xl transition-all"
                        >
                            {t('storeCancel.backToHome')}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
