import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Success() {
    const router = useRouter();
    const { session_id } = router.query;

    return (
        <>
            <Head>
                <title>Platba úspěšná | SupplierSaaS</title>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background-dark flex items-center justify-center px-6">
                <div className="max-w-md w-full text-center">
                    <div className="bg-surface-dark rounded-2xl shadow-2xl p-8 border border-slate-700">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500/30">
                            <span className="material-icons text-green-500 text-5xl">check_circle</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4">Platba byla úspěšná!</h1>
                        <p className="text-slate-400 mb-8">
                            Děkujeme za předplatné! Vaše předplatné bylo aktivováno a můžete začít využívat všechny funkce.
                        </p>
                        {session_id && (
                            <p className="text-xs text-slate-500 mb-6 font-mono">
                                ID relace: {session_id}
                            </p>
                        )}
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="w-full bg-gradient-primary text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
                            >
                                Zpět na přehled
                            </button>
                            <button
                                onClick={() => router.push('/pricing')}
                                className="w-full border-2 border-slate-600 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 transition-all"
                            >
                                Zobrazit ceník
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
