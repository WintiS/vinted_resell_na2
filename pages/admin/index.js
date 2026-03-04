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
    const [withdrawals, setWithdrawals] = useState([]);
    const [updatingWithdrawalId, setUpdatingWithdrawalId] = useState(null);
    const [withdrawalError, setWithdrawalError] = useState('');
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

            const withdrawalsSnapshot = await getDocs(collection(db, 'withdrawals'));
            let withdrawalsData = withdrawalsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                requestedAt: doc.data().requestedAt?.toDate(),
                processedAt: doc.data().processedAt?.toDate()
            }));

            withdrawalsData.sort((a, b) => {
                if (!a.requestedAt) return 1;
                if (!b.requestedAt) return -1;
                return b.requestedAt - a.requestedAt;
            });

            withdrawalsData = withdrawalsData.slice(0, 50);
            setWithdrawals(withdrawalsData);

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

    const handleUpdateWithdrawal = async (withdrawalId, action) => {
        try {
            setWithdrawalError('');
            setUpdatingWithdrawalId(withdrawalId);

            const token = await user.getIdToken();
            const response = await fetch('/api/admin/update-withdrawal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ withdrawalId, action }),
            });
            const data = await response.json();

            if (!response.ok || !data?.success) {
                throw new Error(data?.error || 'Failed to update withdrawal');
            }

            setWithdrawals(prev =>
                prev.map(w =>
                    w.id === withdrawalId
                        ? { ...w, status: data.status, processedAt: new Date(), processedBy: user.email }
                        : w
                )
            );
        } catch (error) {
            console.error('Admin withdrawal update failed:', error);
            setWithdrawalError(error?.message || 'Failed to update withdrawal');
        } finally {
            setUpdatingWithdrawalId(null);
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

    const formatMoney = (amount) => {
        if (lang === 'cs') {
            return `${amount.toFixed(2)} CZK`;
        }
        // EN: divide by 20.5 to convert CZK → USD
        return `$${(amount / 20.5).toFixed(2)}`;
    };

    return (
        <>
            <Head>
                <title>{t('admin.pageTitle')}</title>
                <link rel="icon" href="/logo.ico" />
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
            </Head>

            <div className="min-h-screen bg-background-dark">
                <nav className="bg-surface-dark shadow-xl border-b border-slate-700">
                    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <img src="/pointlogo.png" alt="VintedPoint" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
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
                            <p className="text-3xl font-bold text-yellow-500">{formatMoney(stats.monthlyRevenue)}</p>
                        </div>
                        <div className="bg-surface-dark rounded-xl shadow-xl p-6 border border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-slate-400 text-sm font-medium">{t('admin.stats.totalRevenue')}</h3>
                                <span className="material-icons text-primary">attach_money</span>
                            </div>
                            <p className="text-3xl font-bold text-primary">{formatMoney(stats.totalRevenue)}</p>
                        </div>
                    </div>

                    {/* Users and Sales Tables */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
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
                                                    <span className="font-bold text-green-400">{formatMoney(sale.amount)}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Withdrawals Table */}
                    <div className="bg-surface-dark rounded-xl shadow-xl border border-slate-700">
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <span className="material-icons text-primary">account_balance_wallet</span>
                                Withdrawals
                            </h2>
                            {withdrawalError && (
                                <p className="text-sm text-red-400">{withdrawalError}</p>
                            )}
                        </div>
                        <div className="p-4 overflow-x-auto">
                            {withdrawals.length === 0 ? (
                                <p className="text-sm text-slate-400">No withdrawal requests yet.</p>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700 text-left text-sm">
                                            <th className="py-2 text-slate-400 font-semibold">User</th>
                                            <th className="py-2 text-slate-400 font-semibold">Amount</th>
                                            <th className="py-2 text-slate-400 font-semibold">Bank account</th>
                                            <th className="py-2 text-slate-400 font-semibold">Requested</th>
                                            <th className="py-2 text-slate-400 font-semibold">Status</th>
                                            <th className="py-2 text-slate-400 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {withdrawals.map((w) => (
                                            <tr
                                                key={w.id}
                                                className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                                            >
                                                <td className="py-3">
                                                    <div>
                                                        <p className="font-semibold text-sm text-white">
                                                            {w.displayName || '(no name)'}
                                                        </p>
                                                        <p className="text-xs text-slate-400">{w.email}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-sm text-slate-300">
                                                    {formatMoney(w.amount || 0)}
                                                </td>
                                                <td className="py-3 text-xs text-slate-300 font-mono">
                                                    {w.bankAccount || '-'}
                                                </td>
                                                <td className="py-3 text-sm text-slate-300">
                                                    {w.requestedAt?.toLocaleString(locale) || '-'}
                                                </td>
                                                <td className="py-3 text-sm">
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            w.status === 'approved'
                                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                : w.status === 'declined'
                                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                        }`}
                                                    >
                                                        {w.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    {w.status === 'pending' ? (
                                                        <div className="inline-flex gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    handleUpdateWithdrawal(w.id, 'approve')
                                                                }
                                                                disabled={updatingWithdrawalId === w.id}
                                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                                            >
                                                                {updatingWithdrawalId === w.id
                                                                    ? 'Saving...'
                                                                    : 'Approve'}
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    handleUpdateWithdrawal(w.id, 'decline')
                                                                }
                                                                disabled={updatingWithdrawalId === w.id}
                                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-500">
                                                            {w.processedAt
                                                                ? w.processedAt.toLocaleString(locale)
                                                                : ''}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
