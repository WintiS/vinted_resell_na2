// Debug endpoint to check environment variables
// Access with ?secret=debug123 to prevent public access
export default function handler(req, res) {
    // Basic security - change this secret or remove in production
    const debugSecret = req.query.secret;

    if (process.env.NODE_ENV === 'production' && debugSecret !== 'debug123') {
        return res.status(403).json({ error: 'Forbidden - invalid secret' });
    }

    const envCheck = {
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,

        // Stripe
        hasStripePublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        stripePublishableKeyPrefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10) || 'MISSING',
        hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
        stripeSecretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 10) || 'MISSING',
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,

        // Application
        hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'MISSING',

        // Firebase Public
        hasFirebaseApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        hasFirebaseAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

        // Firebase Admin
        hasFirebaseProjectId: !!process.env.FIREBASE_PROJECT_ID,
        hasFirebaseClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
        hasFirebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,

        // Summary
        allRequired: false,
    };

    // Check if all critical variables are set
    envCheck.allRequired =
        envCheck.hasStripePublishableKey &&
        envCheck.hasStripeSecretKey &&
        envCheck.hasBaseUrl &&
        envCheck.hasFirebaseApiKey;

    res.status(200).json(envCheck);
}
