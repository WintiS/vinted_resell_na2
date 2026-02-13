import Stripe from 'stripe';
import admin from '../../lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, priceId } = req.body;

    // Validate input
    if (!userId || !priceId) {
        return res.status(400).json({ error: 'Missing required fields: userId and priceId' });
    }

    try {
        const userDoc = await admin.firestore().collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.data();
        let customerId = userData.stripeCustomerId;

        // Create Stripe customer if doesn't exist
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: userData.email,
                name: userData.displayName,
                metadata: { firebaseUID: userId }
            });
            customerId = customer.id;

            await admin.firestore().collection('users').doc(userId).update({
                stripeCustomerId: customerId
            });
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            payment_settings: { save_default_payment_method: 'on_subscription' },
            expand: ['latest_invoice.payment_intent'],
        });

        res.status(200).json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        });
    } catch (error) {
        console.error('Subscription creation error:', error);
        res.status(500).json({
            error: error.message || 'Failed to create subscription',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
