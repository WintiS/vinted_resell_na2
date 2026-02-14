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
        // Get user data from Firebase
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
                name: userData.displayName || userData.email,
                metadata: {
                    firebaseUID: userId
                }
            });
            customerId = customer.id;

            // Save customer ID to Firebase
            await admin.firestore().collection('users').doc(userId).update({
                stripeCustomerId: customerId
            });
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
            metadata: {
                firebaseUID: userId,
                priceId: priceId
            },
            subscription_data: {
                metadata: {
                    firebaseUID: userId
                }
            }
        });

        res.status(200).json({
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        console.error('Checkout session creation error:', error);
        res.status(500).json({
            error: error.message || 'Failed to create checkout session',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
