import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { productId, referralCode } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Premium Vinted Suppliers Database',
                            description: '500+ Verified Vinted suppliers with lifetime updates',
                            images: ['https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=400'],
                        },
                        unit_amount: 4999, // $49.99
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store?ref=${referralCode}`,
            metadata: {
                referralCode: referralCode || '',
                productId: productId,
                productName: 'Premium Vinted Suppliers Database'
            },
            payment_intent_data: {
                metadata: {
                    referralCode: referralCode || '',
                    productId: productId,
                    productName: 'Premium Vinted Suppliers Database'
                }
            }
        });

        res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.error('Checkout session error:', error);
        res.status(500).json({ error: error.message });
    }
}
