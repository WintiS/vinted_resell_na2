import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Head from 'next/head';
import { useLanguage } from '../../context/LanguageContext';
import LanguageToggle from '../../components/LanguageToggle';

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [sales, setSales] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeSubscriptions: 0,
        totalRevenue: 0,
        totalSales: 0,
        monthlyRevenue: 0
    });
    const { t, lang } = useLanguage();

    const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
    const isAdmin = user && adminEmails.includes(user.email);

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/dashboard');
        }
    }, [loading, isAdmin, router]);

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin]);

    const loadData = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));
            setUsers(usersData);

            const salesSnapshot = await getDocs(collection(db, 'sales'));
            let salesData = salesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            }));

            salesData.sort((a, b) => {
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return b.createdAt - a.createdAt;
            });

            salesData = salesData.slice(0, 100);
            setSales(salesData);

            const now = new Date();
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const monthSales = salesData.filter(s => s.createdAt >= thisMonth);

            setStats({
                totalUsers: usersData.length,
                activeSubscriptions: usersData.filter(u => u.subscriptionStatus === 'active').length,
                totalRevenue: salesData.reduce((sum, sale) => sum + (sale.amount || 0), 0),
                totalSales: salesData.length,
                monthlyRevenue: monthSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
            });
        } catch (error) {
            console.error('Error loading admin data:', error);
            setStats({ totalUsers: 0, activeSubscriptions: 0, totalRevenue: 0, totalSales: 0, monthlyRevenue: 0 });
        }
    };

    if (loading || !isAdmin) {
        return (
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="text-lg text-white">{t('admin.loading')}</div>
            </div>
        );
    }

    const locale = lang === 'cs' ? 'cs-CZ' : 'en-US';

    return (
        <>
            <Head>
                <title>{t('admin.pageTitle')}</title>
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background-dark">
                <nav className="bg-surface-dark shadow-xl border-b border-slate-700">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="material-icons text-primary text-3xl">admin_panel_settings</span>
                            <h1 className="text-xl font-bold text-white">{t('admin.title')}</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <LanguageToggle />
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="text-primary hover:text-primary/80 font-semibold transition-colors"
                            >
                                {t('admin.backToDashboard')}
                            </button>
                        </div>
                    </div>
                </nav>

                <div className="container mx-auto px-6 py-8">
                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-5 gap-6 mb-8">
                        <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-slate-400 text-sm font-medium">{t('admin.stats.totalUsers')}</h3>
                                <span className="material-icons text-blue-500">group</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                        </div>
                        <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-slate-400 text-sm font-medium">{t('admin.stats.activeSubscriptions')}</h3>
                                <span className="material-icons text-green-500">check_circle</span>
                            </div>
                            <p className="text-3xl font-bold text-green-500">{stats.activeSubscriptions}</p>
                        </div>
                        <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-slate-400 text-sm font-medium">{t('admin.stats.totalSales')}</h3>
                                <span className="material-icons text-purple-500">shopping_bag</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.totalSales}</p>
                        </div>
                        <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-slate-400 text-sm font-medium">{t('admin.stats.thisMonth')}</h3>
                                <span className="material-icons text-yellow-500">calendar_today</span>
                            </div>
                            <p className="text-3xl font-bold text-yellow-500">${stats.monthlyRevenue.toFixed(2)}</p>
                        </div>
                        <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-slate-400 text-sm font-medium">{t('admin.stats.totalRevenue')}</h3>
                                <span className="material-icons text-primary">attach_money</span>
                            </div>
                            <p className="text-3xl font-bold text-primary">${stats.totalRevenue.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Users and Sales Tables */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Users Table */}
                        <div className="bg-surface-dark rounded-xl shadow-xl border border-slate-700">
                            <div className="p-6 border-b border-slate-700">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span className="material-icons text-primary">people</span>
                                    {t('admin.recentUsers')}
                                </h2>
                            </div>
                            <div className="p-4 overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700 text-left text-sm">
                                            <th className="py-2 text-slate-400 font-semibold">{t('admin.table.user')}</th>
                                            <th className="py-2 text-slate-400 font-semibold">{t('admin.table.status')}</th>
                                            <th className="py-2 text-slate-400 font-semibold">{t('admin.table.joined')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.slice(0, 10).map(u => (
                                            <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                                                <td className="py-3">
                                                    <div>
                                                        <p className="font-semibold text-sm text-white">{u.displayName}</p>
                                                        <p className="text-xs text-slate-400">{u.email}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.subscriptionStatus === 'active'
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                                        }`}>
                                                        {u.subscriptionStatus}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-sm text-slate-300">
                                                    {u.createdAt?.toLocaleDateString(locale)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Sales Table */}
                        <div className="bg-surface-dark rounded-xl shadow-xl border border-slate-700">
                            <div className="p-6 border-b border-slate-700">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span className="material-icons text-primary">receipt</span>
                                    {t('admin.recentSales')}
                                </h2>
                            </div>
                            <div className="p-4 overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700 text-left text-sm">
                                            <th className="py-2 text-slate-400 font-semibold">{t('admin.table.product')}</th>
                                            <th className="py-2 text-slate-400 font-semibold">{t('admin.table.link')}</th>
                                            <th className="py-2 text-right text-slate-400 font-semibold">{t('admin.table.price')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sales.slice(0, 10).map(sale => (
                                            <tr key={sale.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                                                <td className="py-3">
                                                    <div>
                                                        <p className="font-semibold text-sm text-white">{sale.productName}</p>
                                                        <p className="text-xs text-slate-400">{sale.createdAt?.toLocaleDateString(locale)}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <span className="font-mono text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">
                                                        {sale.referralCode}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <span className="font-bold text-green-400">${sale.amount.toFixed(2)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
