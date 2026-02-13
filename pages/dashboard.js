import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Head from 'next/head';

export default function Dashboard() {
    const { user, userData, logout, loading } = useAuth();
    const router = useRouter();
    const [sales, setSales] = useState([]);
    const [stats, setStats] = useState({
        totalSales: 0,
        thisMonth: 0,
        lastMonth: 0
    });
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        if (user) {
            loadSales();
        }
    }, [user]);

    const loadSales = async () => {
        try {
            // Simplified query - get all sales for user, sort client-side
            const salesRef = collection(db, 'sales');
            const q = query(
                salesRef,
                where('userId', '==', user.uid)
            );

            const snapshot = await getDocs(q);
            let salesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));

            // Sort by date on client side to avoid index requirement
            salesData.sort((a, b) => {
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return b.createdAt - a.createdAt;
            });

            // Limit to 50 most recent
            salesData = salesData.slice(0, 50);
            setSales(salesData);

            const now = new Date();
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

            const thisMonthSales = salesData.filter(sale => sale.createdAt >= thisMonth);
            const lastMonthSales = salesData.filter(sale =>
                sale.createdAt >= lastMonth && sale.createdAt < thisMonth
            );

            setStats({
                totalSales: salesData.length,
                thisMonth: thisMonthSales.reduce((sum, sale) => sum + (sale.amount || 0), 0),
                lastMonth: lastMonthSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
            });
        } catch (error) {
            console.error('Error loading sales:', error);
            // Set empty stats on error
            setStats({
                totalSales: 0,
                thisMonth: 0,
                lastMonth: 0
            });
        }
    };

    const referralLink = userData?.referralCode
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/store?ref=${userData.referralCode}`
        : '';

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading || !user || !userData) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="text-lg text-white">Loading...</div>
            </div>
        );
    }

    const isActive = userData.subscriptionStatus === 'active';

    return (
        <>
            <Head>
                <title>Přehled | SupplierSaaS</title>
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
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-slate-400">{userData.email}</span>
                            {process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').includes(user.email) && (
                                <button
                                    onClick={() => router.push('/admin')}
                                    className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors flex items-center gap-1"
                                >
                                    <span className="material-icons text-sm">admin_panel_settings</span>
                                    Admin
                                </button>
                            )}
                            <button
                                onClick={logout}
                                className="text-red-400 hover:text-red-300 font-semibold text-sm transition-colors"
                            >
                                Odhlásit se
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="container mx-auto px-6 py-8">
                    {/* Subscription Warning */}
                    {!isActive && (
                        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-6 mb-6 flex items-start gap-4">
                            <span className="material-icons text-yellow-500 text-3xl">warning</span>
                            <div className="flex-1">
                                <h3 className="text-yellow-500 font-bold text-lg mb-2">Vyžadováno předplatné</h3>
                                <p className="text-slate-300 mb-4">
                                    Vaše předplatné je neaktivní. Přihlašte se k aktivaci vašeho affiliátního odkazu a začněte vydělávat provize.
                                </p>
                                <button
                                    onClick={() => router.push('/pricing')}
                                    className="bg-gradient-primary text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
                                >
                                    Předplatit nyní
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Referral Link */}
                    <div className="bg-surface-dark rounded-xl shadow-xl p-6 mb-6 border border-slate-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="material-icons text-primary">link</span>
                            Váš unikátní affiliátní odkaz
                        </h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={referralLink}
                                readOnly
                                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-300 font-mono text-sm"
                            />
                            <button
                                onClick={copyLink}
                                className="bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all whitespace-nowrap"
                            >
                                {copied ? (
                                    <>
                                        <span className="material-icons text-sm">check</span> Zkopírováno!
                                    </>
                                ) : (
                                    <>
                                        <span className="material-icons text-sm">content_copy</span> Zkopírovat
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-sm text-slate-400 mt-3 flex items-center gap-1">
                            <span className="material-icons text-xs">info</span>
                            Sdílejte tento odkaz a vydělávejte 100% provizi za každý prodej
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-slate-400 text-sm font-medium">Celkem prodejů</h3>
                                <span className="material-icons text-primary">shopping_cart</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.totalSales}</p>
                        </div>
                        <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-slate-400 text-sm font-medium">Tento měsíc</h3>
                                <span className="material-icons text-green-500">trending_up</span>
                            </div>
                            <p className="text-3xl font-bold text-green-500">${stats.thisMonth.toFixed(2)}</p>
                        </div>
                        <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-slate-400 text-sm font-medium">Minulý měsíc</h3>
                                <span className="material-icons text-slate-500">calendar_month</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-300">${stats.lastMonth.toFixed(2)}</p>
                        </div>
                        <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-slate-400 text-sm font-medium">Dostupný zůstatek</h3>
                                <span className="material-icons text-blue-500">account_balance_wallet</span>
                            </div>
                            <p className="text-3xl font-bold text-blue-500">${(userData.availableBalance || 0).toFixed(2)}</p>
                            {(userData.availableBalance || 0) >= 50 && (
                                <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 w-full transition-colors">
                                    Požádat o výběr
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Recent Sales */}
                    <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="material-icons text-primary">receipt_long</span>
                            Nedávné prodeje
                        </h2>
                        {sales.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="material-icons text-slate-600 text-6xl mb-4">inbox</span>
                                <p className="text-slate-400 text-lg mb-2">Zatím žádné prodeje</p>
                                <p className="text-slate-500 text-sm">Začněte sdílet váš affiliátní odkaz a uvidíte prodeje zde!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-3 px-2 text-slate-400 font-semibold text-sm">Datum</th>
                                            <th className="text-left py-3 px-2 text-slate-400 font-semibold text-sm">Produkt</th>
                                            <th className="text-right py-3 px-2 text-slate-400 font-semibold text-sm">Cena</th>
                                            <th className="text-right py-3 px-2 text-slate-400 font-semibold text-sm">Provize</th>
                                            <th className="text-center py-3 px-2 text-slate-400 font-semibold text-sm">Stav</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sales.map(sale => (
                                            <tr key={sale.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                                                <td className="py-3 px-2 text-slate-300">
                                                    {sale.createdAt?.toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-2 text-white">{sale.productName}</td>
                                                <td className="text-right py-3 px-2 text-slate-300">${sale.amount.toFixed(2)}</td>
                                                <td className="text-right py-3 px-2 text-green-400 font-semibold">
                                                    ${sale.commission.toFixed(2)}
                                                </td>
                                                <td className="text-center py-3 px-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sale.status === 'completed'
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        : sale.status === 'pending'
                                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                        }`}>
                                                        {sale.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
