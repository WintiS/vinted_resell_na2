import { buffer } from 'micro';
import Stripe from 'stripe';
import admin from '../../../lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const db = admin.firestore();

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
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                const subscription = event.data.object;
                const customerId = subscription.customer;

                const userSnapshot = await db.collection('users')
                    .where('stripeCustomerId', '==', customerId)
                    .limit(1)
                    .get();

                if (!userSnapshot.empty) {
                    const userDoc = userSnapshot.docs[0];
                    await userDoc.ref.update({
                        subscriptionStatus: subscription.status,
                        subscriptionId: subscription.id,
                        subscriptionTier: subscription.items.data[0].price.recurring.interval,
                        subscriptionStartDate: new Date(subscription.current_period_start * 1000),
                        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
                    });
                }
                break;

            case 'customer.subscription.deleted':
                const deletedSub = event.data.object;
                const deletedCustomerId = deletedSub.customer;

                const deletedUserSnapshot = await db.collection('users')
                    .where('stripeCustomerId', '==', deletedCustomerId)
                    .limit(1)
                    .get();

                if (!deletedUserSnapshot.empty) {
                    await deletedUserSnapshot.docs[0].ref.update({
                        subscriptionStatus: 'cancelled',
                    });
                }
                break;

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
