import Stripe from 'stripe';
import admin from '../../../lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        // Get user data from Firebase
        const userDoc = await admin.firestore().collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        const customerId = userData.stripeCustomerId;

        if (!customerId) {
            return res.status(400).json({ error: 'No Stripe customer found. Please subscribe first.' });
        }

        // Create a Customer Portal session
        const session = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Customer portal error:', error);
        res.status(500).json({
            error: error.message || 'Failed to create customer portal session',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
