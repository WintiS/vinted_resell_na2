import admin from '../../../lib/firebase-admin';

function getAdminEmailsFromEnv() {
    return String(process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
    if (!idToken) {
        return res.status(401).json({ success: false, error: 'Missing Authorization token' });
    }

    const { withdrawalId, action } = req.body || {};
    if (!withdrawalId || (action !== 'approve' && action !== 'decline')) {
        return res.status(400).json({ success: false, error: 'Invalid request payload' });
    }

    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        const requesterEmail = decoded.email || '';
        const adminEmails = getAdminEmailsFromEnv();

        if (!adminEmails.length) {
            return res.status(500).json({ success: false, error: 'Admin emails not configured' });
        }

        if (!requesterEmail || !adminEmails.includes(requesterEmail)) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        const db = admin.firestore();
        const withdrawalRef = db.collection('withdrawals').doc(withdrawalId);

        await db.runTransaction(async (tx) => {
            const snap = await tx.get(withdrawalRef);
            if (!snap.exists) {
                throw new Error('Withdrawal not found');
            }

            const withdrawal = snap.data();
            if (withdrawal.status !== 'pending') {
                throw new Error('Only pending withdrawals can be updated');
            }

            const userId = withdrawal.userId;
            if (!userId) {
                throw new Error('Withdrawal missing userId');
            }

            const userRef = db.collection('users').doc(userId);
            const userSnap = await tx.get(userRef);
            if (!userSnap.exists) {
                throw new Error('User not found for withdrawal');
            }

            const now = new Date();
            const updateData = {
                status: action === 'approve' ? 'approved' : 'declined',
                processedAt: now,
                processedBy: requesterEmail,
            };

            tx.update(withdrawalRef, updateData);

            if (action === 'approve') {
                tx.update(userRef, {
                    availableBalance: 0,
                });
            }
        });

        return res.status(200).json({
            success: true,
            status: action === 'approve' ? 'approved' : 'declined',
        });
    } catch (error) {
        console.error('Update withdrawal error:', error);
        return res.status(500).json({ success: false, error: error?.message || 'Failed to update withdrawal' });
    }
}

