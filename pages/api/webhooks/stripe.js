import { buffer } from 'micro';
import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Initialize Firebase Admin
if (!getApps().length) {
    initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
}

const db = getFirestore();

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;

                if (session.payment_status === 'paid' && session.metadata?.referralCode) {
                    const referralCode = session.metadata.referralCode;
                    const amount = session.amount_total / 100;

                    // Find the affiliate by referral code
                    const usersSnapshot = await db.collection('users')
                        .where('referralCode', '==', referralCode)
                        .limit(1)
                        .get();

                    if (!usersSnapshot.empty) {
                        const affiliateDoc = usersSnapshot.docs[0];

                        // Create sale record
                        await db.collection('sales').add({
                            userId: affiliateDoc.id,
                            referralCode,
                            amount,
                            commission: amount,
                            productId: session.metadata.productId,
                            productName: session.metadata.productName,
                            status: 'completed',
                            stripePaymentId: session.payment_intent,
                            createdAt: new Date(),
                        });

                        // Update affiliate earnings
                        await affiliateDoc.ref.update({
                            totalEarnings: (affiliateDoc.data().totalEarnings || 0) + amount,
                            availableBalance: (affiliateDoc.data().availableBalance || 0) + amount,
                            lifetimeEarnings: (affiliateDoc.data().lifetimeEarnings || 0) + amount,
                        });
                    }
                }
                break;
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
}
