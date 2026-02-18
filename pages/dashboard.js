import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Head from 'next/head';
import { useLanguage } from '../context/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';

export default function Dashboard() {
    const { user, userData, logout, loading } = useAuth();
    const router = useRouter();
    const [sales, setSales] = useState([]);
    const [stats, setStats] = useState({ totalSales: 0, thisMonth: 0, lastMonth: 0 });
    const [copied, setCopied] = useState(false);
    const { t, lang } = useLanguage();

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
            const salesRef = collection(db, 'sales');
            const q = query(salesRef, where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            let salesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));

            salesData.sort((a, b) => {
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return b.createdAt - a.createdAt;
            });

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
            setStats({ totalSales: 0, thisMonth: 0, lastMonth: 0 });
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
                <div className="text-lg text-white">{t('dashboard.loading')}</div>
            </div>
        );
    }

    const isActive = userData.subscriptionStatus === 'active';
    const locale = lang === 'cs' ? 'cs-CZ' : 'en-US';

    const translateStatus = (status) => {
        if (status === 'completed') return t('dashboard.status.completed');
        if (status === 'pending') return t('dashboard.status.pending');
        if (status === 'failed') return t('dashboard.status.failed');
        return status;
    };

    return (
        <>
            <Head>
                <title>{t('dashboard.pageTitle')}</title>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background-dark">
                {/* Navigation */}
                <nav className="bg-surface-dark shadow-xl border-b border-slate-700">
                    <div className="container mx-auto px-4 sm:px-6 py-3 md:py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                                    <span className="material-icons text-white text-xl md:text-2xl">rocket_launch</span>
                                </div>
                                <h1 className="text-lg md:text-xl font-bold text-white">
                                    Supplier<span className="text-primary">SaaS</span>
                                </h1>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4">
                                <LanguageToggle />
                                <span className="hidden sm:block text-xs md:text-sm text-slate-400 truncate max-w-[120px] md:max-w-none">{userData.email}</span>
                                {process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').includes(user.email) && (
                                    <button
                                        onClick={() => router.push('/admin')}
                                        className="text-primary hover:text-primary/80 font-semibold text-xs md:text-sm transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-icons text-sm md:text-base">admin_panel_settings</span>
                                        <span className="hidden sm:inline">{t('nav.admin')}</span>
                                    </button>
                                )}
                                <button
                                    onClick={logout}
                                    className="text-red-400 hover:text-red-300 font-semibold text-xs md:text-sm transition-colors"
                                >
                                    <span className="material-icons sm:hidden text-base">logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
                    {/* Subscription Warning */}
                    {!isActive && (
                        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 md:p-6 mb-4 md:mb-6 flex flex-col sm:flex-row items-start gap-3 md:gap-4">
                            <span className="material-icons text-yellow-500 text-2xl md:text-3xl">warning</span>
                            <div className="flex-1">
                                <h3 className="text-yellow-500 font-bold text-base md:text-lg mb-2">{t('dashboard.subscriptionWarning.title')}</h3>
                                <p className="text-slate-300 text-sm md:text-base mb-3 md:mb-4">
                                    {t('dashboard.subscriptionWarning.desc')}
                                </p>
                                <button
                                    onClick={() => router.push('/pricing')}
                                    className="bg-gradient-primary text-white px-4 md:px-6 py-2 rounded-lg text-sm md:text-base font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all w-full sm:w-auto"
                                >
                                    {t('dashboard.subscriptionWarning.cta')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Subscription Status Card */}
                    {isActive && (
                        <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-green-500/50 rounded-xl p-6 mb-6">
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                                        <span className="material-icons text-green-500 text-2xl">check_circle</span>
                                    </div>
                                    <div>
                                        <h3 className="text-green-400 font-bold text-lg mb-1 flex items-center gap-2">
                                            {t('dashboard.subscription.active')}
                                            <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30 capitalize">
                                                {userData.subscriptionTier || 'monthly'}
                                            </span>
                                        </h3>
                                        {userData.subscriptionEndDate && (
                                            <p className="text-slate-300 text-sm flex items-center gap-1">
                                                <span className="material-icons text-xs">event</span>
                                                {t('dashboard.subscription.renewal')} {new Date(userData.subscriptionEndDate.seconds * 1000).toLocaleDateString(locale, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        try {
                                            const response = await fetch('/api/create-portal-session', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ userId: user.uid })
                                            });
                                            const data = await response.json();
                                            if (data.url) {
                                                window.location.href = data.url;
                                            }
                                        } catch (error) {
                                            console.error('Portal error:', error);
                                            alert(t('dashboard.subscription.error'));
                                        }
                                    }}
                                    className="bg-white text-slate-900 px-6 py-2.5 rounded-lg font-semibold hover:bg-slate-200 transition-all flex items-center gap-2 whitespace-nowrap"
                                >
                                    <span className="material-icons text-sm">settings</span>
                                    {t('dashboard.subscription.manage')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Referral Link */}
                    <div className="bg-surface-dark rounded-xl shadow-xl p-4 md:p-6 mb-4 md:mb-6 border border-slate-700">
                        <h2 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 flex items-center gap-2">
                            <span className="material-icons text-primary text-xl md:text-2xl">link</span>
                            {t('dashboard.referral.title')}
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                value={referralLink}
                                readOnly
                                className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 md:px-4 py-2 md:py-3 text-slate-300 font-mono text-xs md:text-sm"
                            />
                            <button
                                onClick={copyLink}
                                className="bg-gradient-primary text-white px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all whitespace-nowrap flex items-center justify-center gap-1"
                            >
                                {copied ? (
                                    <>
                                        <span className="material-icons text-sm md:text-base">check</span>
                                        <span className="hidden sm:inline">{t('dashboard.referral.copied')}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-icons text-sm md:text-base">content_copy</span>
                                        <span className="hidden sm:inline">{t('dashboard.referral.copy')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-xs md:text-sm text-slate-400 mt-2 md:mt-3 flex items-start md:items-center gap-1">
                            <span className="material-icons text-xs mt-0.5 md:mt-0">info</span>
                            <span>{t('dashboard.referral.hint')}</span>
                        </p>
                    </div>

                    {/* View Store */}
                    <div className="bg-surface-dark rounded-xl shadow-xl p-6 mb-6 border border-slate-700">
                        <div className="text-center">
                            <button
                                onClick={() => router.push('/store')}
                                className="w-full justify-center bg-gradient-primary text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all inline-flex items-center gap-2"
                            >
                                <span className="material-icons text-sm">shopping_bag</span>
                                {t('dashboard.viewStore')}
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
                        <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-slate-400 text-sm font-medium">{t('dashboard.stats.totalSales')}</h3>
                                <span className="material-icons text-primary">shopping_cart</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.totalSales}</p>
                        </div>
                        <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-slate-400 text-sm font-medium">{t('dashboard.stats.thisMonth')}</h3>
                                <span className="material-icons text-green-500">trending_up</span>
                            </div>
                            <p className="text-3xl font-bold text-green-500">{stats.thisMonth.toFixed(0)} Kč</p>
                        </div>
                        <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-slate-400 text-sm font-medium">{t('dashboard.stats.lastMonth')}</h3>
                                <span className="material-icons text-slate-500">calendar_month</span>
                            </div>
                            <p className="text-3xl font-bold text-slate-300">{stats.lastMonth.toFixed(0)} Kč</p>
                        </div>
                        <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-slate-400 text-sm font-medium">{t('dashboard.stats.balance')}</h3>
                                <span className="material-icons text-blue-500">account_balance_wallet</span>
                            </div>
                            <p className="text-3xl font-bold text-blue-500">{(userData.availableBalance || 0).toFixed(0)} Kč</p>
                            {(userData.availableBalance || 0) >= 50 && (
                                <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 w-full transition-colors">
                                    {t('dashboard.stats.withdraw')}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Recent Sales */}
                    <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="material-icons text-primary">receipt_long</span>
                            {t('dashboard.recentSales.title')}
                        </h2>
                        {sales.length === 0 ? (
                            <div className="text-center py-12">
                                <span className="material-icons text-slate-600 text-6xl mb-4">inbox</span>
                                <p className="text-slate-400 text-lg mb-2">{t('dashboard.recentSales.empty.title')}</p>
                                <p className="text-slate-500 text-sm">{t('dashboard.recentSales.empty.desc')}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700">
                                            <th className="text-left py-3 px-2 text-slate-400 font-semibold text-sm">{t('dashboard.recentSales.date')}</th>
                                            <th className="text-left py-3 px-2 text-slate-400 font-semibold text-sm">{t('dashboard.recentSales.product')}</th>
                                            <th className="text-right py-3 px-2 text-slate-400 font-semibold text-sm">{t('dashboard.recentSales.price')}</th>
                                            <th className="text-center py-3 px-2 text-slate-400 font-semibold text-sm">{t('dashboard.recentSales.status')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sales.map(sale => (
                                            <tr key={sale.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                                                <td className="py-3 px-2 text-slate-300">
                                                    {sale.createdAt?.toLocaleDateString(locale)}
                                                </td>
                                                <td className="py-3 px-2 text-white">{sale.productName}</td>
                                                <td className="text-right py-3 px-2 text-slate-300">{sale.amount.toFixed(0)} Kč</td>
                                                <td className="text-center py-3 px-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sale.status === 'completed'
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        : sale.status === 'pending'
                                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                        }`}>
                                                        {translateStatus(sale.status)}
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
