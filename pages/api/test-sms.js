import admin from '../../lib/firebase-admin';
import { getDefaultAdminPhone, sendSms } from '../../lib/sms';

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

    try {
        const decoded = await admin.auth().verifyIdToken(idToken);

        const adminEmails = getAdminEmailsFromEnv();
        if (!adminEmails.length) {
            return res.status(500).json({ success: false, error: 'Admin emails not configured' });
        }

        const requesterEmail = decoded.email || '';
        if (!requesterEmail || !adminEmails.includes(requesterEmail)) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }

        const now = new Date();
        const pragueTime = now.toLocaleString('cs-CZ', { timeZone: 'Europe/Prague' });
        const body = [
            'TEST SMS (Twilio)',
            `Requested by: ${requesterEmail}`,
            `Date/time (Prague): ${pragueTime}`,
            `Date/time (ISO): ${now.toISOString()}`,
        ].join('\n');

        const toPhone = getDefaultAdminPhone();
        const smsResult = await sendSms(toPhone, body);

        if (!smsResult.success) {
            return res.status(500).json({ success: false, error: smsResult.error || 'Failed to send SMS' });
        }

        return res.status(200).json({ success: true, sid: smsResult.sid });
    } catch (error) {
        console.error('Test SMS error:', error);
        return res.status(500).json({ success: false, error: error?.message || 'Failed to send SMS' });
    }
}

