import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { items, referralCode } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items in cart' });
        }

        // Parse price from Czech format (e.g., "1.281,00 Kč") to cents
        const parsePriceToKc = (priceStr) => {
            // Remove everything except digits, dots, and commas
            const cleaned = priceStr.replace(/[^\d.,]/g, '');
            // Replace comma with dot and parse
            const numericPrice = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
            // Return price in korunas (smallest unit for CZK is 1 koruna = 100 haléřů, but we use whole korunas)
            return Math.round(numericPrice);
        };

        // Create line items with price_data (dynamic pricing)
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'czk',
                product_data: {
                    name: item.title,
                    description: `Digital product access - ${item.title}`,
                },
                unit_amount: parsePriceToKc(item.price) * 100, // Stripe requires amount in haléřů (cents)
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
                productIds: items.map(item => item.id).join(',')
            },
            allow_promotion_codes: true
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: error.message });
    }
}
