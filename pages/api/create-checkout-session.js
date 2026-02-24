import Stripe from 'stripe';
import admin from '../../lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, plan, currency } = req.body;

    // Validate input
    if (!userId || !plan) {
        return res.status(400).json({ error: 'Missing required fields: userId and plan' });
    }

    try {
        const USD_TO_CZK = 20.5;

        const plansConfig = {
            monthly: {
                amountUsd: 18,
                interval: 'month',
            },
            yearly: {
                amountUsd: 79,
                interval: 'year',
            },
        };

        const selectedPlan = plansConfig[plan];

        if (!selectedPlan) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        const checkoutCurrencyRaw = (currency || 'usd').toString().toLowerCase();
        const checkoutCurrency = checkoutCurrencyRaw === 'czk' ? 'czk' : 'usd';

        const getUnitAmount = () => {
            if (checkoutCurrency === 'usd') {
                return Math.round(selectedPlan.amountUsd * 100);
            }
            return Math.round(selectedPlan.amountUsd * USD_TO_CZK * 100);
        };

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

        // Create Checkout Session with dynamic price data (no hardcoded Stripe price IDs)
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: checkoutCurrency,
                        product_data: {
                            name: 'VintedPoint Subscription',
                            description: plan === 'yearly'
                                ? 'Yearly subscription to VintedPoint'
                                : 'Monthly subscription to VintedPoint',
                        },
                        recurring: {
                            interval: selectedPlan.interval,
                        },
                        unit_amount: getUnitAmount(),
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
            metadata: {
                firebaseUID: userId,
                plan,
                currency: checkoutCurrency,
            },
            subscription_data: {
                metadata: {
                    firebaseUID: userId,
                    plan,
                },
                trial_period_days: 7,
            },
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
