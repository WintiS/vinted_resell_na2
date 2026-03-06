import admin from '../../lib/firebase-admin';
import { getDefaultAdminPhone, sendSms } from '../../lib/sms';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';
    if (!idToken) {
        return res.status(401).json({ success: false, error: 'Missing Authorization token' });
    }

    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        const uid = decoded.uid;

        const db = admin.firestore();
        const userSnap = await db.collection('users').doc(uid).get();
        if (!userSnap.exists) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const userData = userSnap.data() || {};
        const displayName = userData.displayName || '';
        const email = userData.email || '';
        const bankAccount = (userData.bankAccount || '').trim();
        const availableBalance = Number(userData.availableBalance || 0);

        // Prevent creating multiple pending requests
        const pendingSnap = await db
            .collection('withdrawals')
            .where('userId', '==', uid)
            .where('status', '==', 'pending')
            .limit(1)
            .get();
        if (!pendingSnap.empty) {
            return res.status(400).json({
                success: false,
                error: 'You already have a pending withdrawal request',
                code: 'PENDING_WITHDRAWAL_EXISTS',
            });
        }

        if (!bankAccount) {
            return res.status(400).json({ success: false, error: 'Missing bank account number' });
        }

        if (!(availableBalance > 0)) {
            return res.status(400).json({ success: false, error: 'Balance must be more than 0 to withdraw' });
        }

        const requestedAt = new Date();
        const amount = availableBalance;

        const withdrawalDoc = {
            userId: uid,
            email,
            displayName,
            amount,
            bankAccount,
            status: 'pending',
            requestedAt,
            // Extra helpful context for manual processing
            userAgent: req.headers['user-agent'] || '',
            ip:
                (typeof req.headers['x-forwarded-for'] === 'string' && req.headers['x-forwarded-for'].split(',')[0].trim()) ||
                req.socket?.remoteAddress ||
                '',
        };

        const withdrawalRef = await db.collection('withdrawals').add(withdrawalDoc);

        const pragueTime = requestedAt.toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' });
        const smsBody = [
            'WITHDRAWAL REQUEST',
            `Name: ${displayName || '(no name)'}`,
            `Email: ${email || '(no email)'}`,
            `Amount: ${amount}`,
            `Bank account: ${bankAccount}`,
            `Date/time (Prague): ${pragueTime}`,
            `Date/time (ISO): ${requestedAt.toISOString()}`,
            `Withdrawal ID: ${withdrawalRef.id}`,
        ].join('\n');

        const toPhone = getDefaultAdminPhone();
        const smsResult = await sendSms(toPhone, smsBody);

        if (!smsResult.success) {
            console.error('⚠️ Failed to send withdrawal SMS:', smsResult.error);
        }

        return res.status(200).json({
            success: true,
            withdrawalId: withdrawalRef.id,
            notificationSent: smsResult.success,
            notificationError: smsResult.success ? undefined : smsResult.error,
        });
    } catch (error) {
        console.error('Withdrawal request error:', error);
        return res.status(500).json({ success: false, error: error?.message || 'Withdrawal request failed' });
    }
}

