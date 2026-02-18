import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { items, referralCode, currency } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items in cart' });
        }

        const USD_TO_CZK = 23;

        const checkoutCurrency = (currency || 'czk').toLowerCase();
        if (checkoutCurrency !== 'czk' && checkoutCurrency !== 'usd') {
            return res.status(400).json({ error: 'Invalid currency' });
        }

        // Returns unit_amount for Stripe (in the smallest currency unit: cents/haléřů)
        const getUnitAmount = (item) => {
            // Preferred: priceUsd (number)
            if (item.priceUsd !== undefined) {
                if (checkoutCurrency === 'usd') {
                    return Math.round(item.priceUsd * 100);
                }
                // czk
                return Math.round(item.priceUsd * USD_TO_CZK) * 100;
            }

            // Legacy: price string (assumed CZK, e.g., "1.281,00 Kč")
            if (item.price) {
                if (checkoutCurrency !== 'czk') {
                    throw new Error(`Legacy price format only supported for CZK checkout: ${item.title}`);
                }
                const cleaned = item.price.replace(/[^\d.,]/g, '');
                const numericPrice = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
                return Math.round(numericPrice) * 100;
            }

            throw new Error(`Invalid price format for item: ${item.title}`);
        };

        // Create line items with price_data (dynamic pricing)
        const lineItems = items.map(item => ({
            price_data: {
                currency: checkoutCurrency,
                product_data: {
                    name: item.title,
                    description: `Digital product access - ${item.title}`,
                },
                unit_amount: getUnitAmount(item), // Stripe requires amount in smallest currency unit
            },
            quantity: item.quantity || 1
        }));

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store/cancel`,
            metadata: {
                referralCode: referralCode || '',
                productIds: items.map(item => item.id).join(','),
                productNames: items.map(item => item.title).join(' | ')
            },
            allow_promotion_codes: true
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: error.message });
    }
}
