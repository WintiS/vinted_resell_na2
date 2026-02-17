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

                // Try to find user by customer ID first
                let userSnapshot = await db.collection('users')
                    .where('stripeCustomerId', '==', customerId)
                    .limit(1)
                    .get();

                // If not found and we have firebaseUID in metadata, try that
                if (userSnapshot.empty && subscription.metadata?.firebaseUID) {
                    const userId = subscription.metadata.firebaseUID;
                    const userDoc = await db.collection('users').doc(userId).get();
                    if (userDoc.exists) {
                        userSnapshot = { empty: false, docs: [userDoc] };
                    }
                }

                if (!userSnapshot.empty) {
                    const userDoc = userSnapshot.docs[0];

                    // Get the period dates from the subscription items
                    const subscriptionItem = subscription.items?.data?.[0];
                    const currentPeriodStart = subscriptionItem?.current_period_start || subscription.billing_cycle_anchor;
                    const currentPeriodEnd = subscriptionItem?.current_period_end;

                    const updateData = {
                        subscriptionStatus: subscription.status,
                        subscriptionId: subscription.id,
                        subscriptionTier: subscription.items.data[0].price.recurring.interval,
                    };

                    if (currentPeriodStart) {
                        updateData.subscriptionStartDate = new Date(currentPeriodStart * 1000);
                    }

                    if (currentPeriodEnd) {
                        updateData.subscriptionEndDate = new Date(currentPeriodEnd * 1000);
                    }

                    await userDoc.ref.update(updateData);
                    console.log('Subscription updated for user:', userDoc.id);
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

                if (session.payment_status === 'paid') {
                    const referralCode = session.metadata?.referralCode;
                    const productIds = session.metadata?.productIds; // Store purchases
                    const productId = session.metadata?.productId; // Legacy subscription purchases
                    const productNames = session.metadata?.productNames; // Product names from store
                    const productName = session.metadata?.productName; // Legacy subscription product name
                    const customerEmail = session.customer_details?.email;
                    const amount = session.amount_total / 100; // Convert from cents/haléřů
                    const currency = session.currency;

                    console.log('Processing checkout.session.completed:', {
                        sessionId: session.id,
                        referralCode,
                        productIds,
                        productNames,
                        customerEmail,
                        amount,
                        currency
                    });

                    // Handle referral commission if referral code exists
                    if (referralCode) {
                        try {
                            const usersSnapshot = await db.collection('users')
                                .where('referralCode', '==', referralCode)
                                .limit(1)
                                .get();

                            if (!usersSnapshot.empty) {
                                const affiliateDoc = usersSnapshot.docs[0];

                                // Calculate commission (100% for store purchases, 10% for subscriptions)
                                const commissionRate = productIds ? 1.0 : 0.10; // 100% for store, 10% for subs
                                const commission = amount * commissionRate;

                                // Create sale record
                                await db.collection('sales').add({
                                    userId: affiliateDoc.id,
                                    referralCode,
                                    amount,
                                    commission,
                                    commissionRate,
                                    currency,
                                    productId: productIds || productId, // Support both formats
                                    productName: productNames || productName || 'Unknown Product',
                                    type: productIds ? 'store' : 'subscription',
                                    status: 'completed',
                                    stripePaymentId: session.payment_intent,
                                    sessionId: session.id,
                                    customerEmail,
                                    createdAt: new Date(),
                                });

                                // Update affiliate earnings
                                await affiliateDoc.ref.update({
                                    totalEarnings: admin.firestore.FieldValue.increment(commission),
                                    availableBalance: admin.firestore.FieldValue.increment(commission),
                                    lifetimeEarnings: admin.firestore.FieldValue.increment(commission),
                                    referralCount: admin.firestore.FieldValue.increment(1),
                                });

                                console.log(`✅ Credited ${commission} ${currency} to affiliate: ${affiliateDoc.id}`);
                            } else {
                                console.log(`⚠️ Referral code not found: ${referralCode}`);
                            }
                        } catch (error) {
                            console.error('❌ Error processing referral commission:', error);
                            // Don't throw - continue with other operations
                        }
                    }

                    // Grant product access for store purchases
                    if (productIds && customerEmail) {
                        try {
                            const products = productIds.split(',');

                            // Find user by email
                            const userSnapshot = await db.collection('users')
                                .where('email', '==', customerEmail)
                                .limit(1)
                                .get();

                            if (!userSnapshot.empty) {
                                const userDoc = userSnapshot.docs[0];

                                // Grant access to each purchased product
                                for (const productId of products) {
                                    await db.collection('userProducts').add({
                                        userId: userDoc.id,
                                        productId,
                                        purchasedAt: new Date(),
                                        sessionId: session.id,
                                        status: 'active',
                                    });
                                }

                                console.log(`✅ Granted access to ${products.length} product(s) for user: ${userDoc.id}`);
                            } else {
                                console.log(`⚠️ User not found for email: ${customerEmail}. Creating pending access record.`);

                                // Create pending access record for when user signs up
                                const products = productIds.split(',');
                                for (const productId of products) {
                                    await db.collection('pendingProductAccess').add({
                                        email: customerEmail,
                                        productId,
                                        sessionId: session.id,
                                        purchasedAt: new Date(),
                                        status: 'pending',
                                    });
                                }
                                console.log(`✅ Created pending access for ${products.length} product(s)`);
                            }
                        } catch (error) {
                            console.error('❌ Error granting product access:', error);
                            // Don't throw - continue with purchase recording
                        }
                    }

                    // Record purchase
                    try {
                        await db.collection('purchases').add({
                            sessionId: session.id,
                            customerEmail,
                            referralCode,
                            productIds: productIds || productId,
                            productNames: productNames || productName || 'Unknown Product',
                            amount,
                            currency,
                            stripePaymentId: session.payment_intent,
                            createdAt: new Date(),
                        });
                        console.log(`✅ Purchase recorded for session: ${session.id}`);
                    } catch (error) {
                        console.error('❌ Error recording purchase:', error);
                        // Don't throw - this is just for record keeping
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
