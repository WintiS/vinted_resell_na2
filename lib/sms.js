import twilio from 'twilio';

function getTwilioClient() {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) return null;
    return twilio(sid, token);
}

function normalizeToE164(phone) {
    const raw = String(phone || '').trim();
    if (!raw) return '';
    if (raw.startsWith('+')) return raw;
    // Assumption: Czech local number provided (e.g. 737536910) -> +420737536910
    const digits = raw.replace(/[^\d]/g, '');
    if (!digits) return '';
    if (digits.startsWith('00')) return `+${digits.slice(2)}`;
    return `+420${digits}`;
}

/**
 * Send an SMS via Twilio.
 * @param {string} to - Recipient phone number (E.164 or local CZ digits)
 * @param {string} body - SMS text
 * @returns {Promise<{success: boolean, sid?: string, error?: string}>}
 */
export async function sendSms(to, body) {
    const client = getTwilioClient();
    if (!client) {
        return { success: false, error: 'TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN not configured' };
    }
    if (!process.env.TWILIO_FROM) {
        return { success: false, error: 'TWILIO_FROM is not configured' };
    }

    const toE164 = normalizeToE164(to);
    if (!toE164) return { success: false, error: 'Invalid recipient phone number' };

    try {
        const msg = await client.messages.create({
            from: process.env.TWILIO_FROM,
            to: toE164,
            body: String(body || '').slice(0, 1500),
        });
        return { success: true, sid: msg.sid };
    } catch (error) {
        return { success: false, error: error?.message || 'Failed to send SMS' };
    }
}

export function getDefaultAdminPhone() {
    return process.env.ADMIN_PHONE || '+420737536910';
}

