import Head from 'next/head';

export default function TermsAndConditions() {
    return (
        <>
            <Head>
                <title>Terms and Conditions | VintedPoint</title>
                <meta name="description" content="Terms and conditions for using the VintedPoint platform." />
            </Head>
            <div className="min-h-screen bg-background-dark text-white">
                <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-6">Terms and Conditions</h1>
                    <p className="text-slate-300 mb-4">
                        By using this platform, you agree to these Terms and Conditions. Please read them carefully before creating an
                        account, subscribing, or using any of our services.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-3">1. Use of the Platform</h2>
                    <p className="text-slate-300 mb-4">
                        You may use this platform only for lawful purposes and in accordance with these Terms and Conditions and any
                        applicable local laws and platform rules.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-3">2. Subscriptions and Payments</h2>
                    <p className="text-slate-300 mb-4">
                        Access to certain features or services on this platform may require a paid subscription. By starting a
                        subscription, you authorize us and our payment processor to charge the applicable subscription fees using the
                        payment method you provide.
                    </p>
                    <p className="text-slate-300 mb-4">
                        The platform reserves the right to charge customers 4&nbsp;USD to verify the payment card after they subscribe.
                        This verification charge may appear as a separate transaction or as part of the initial billing, depending on
                        your bank or card issuer&apos;s policies.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-3">3. Changes to the Service</h2>
                    <p className="text-slate-300 mb-4">
                        We may modify, suspend, or discontinue any part of the platform at any time, including features, pricing, or
                        content, with or without prior notice.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-3">4. Termination</h2>
                    <p className="text-slate-300 mb-4">
                        We may suspend or terminate your access to the platform if you violate these Terms and Conditions or engage in
                        fraudulent, abusive, or unlawful activities.
                    </p>

                    <h2 className="text-2xl font-bold mt-10 mb-3">5. Changes to These Terms</h2>
                    <p className="text-slate-300 mb-8">
                        We may update these Terms and Conditions from time to time. The updated version will be effective when posted on
                        this page. Your continued use of the platform after any changes means you accept the updated terms.
                    </p>

                    <p className="text-slate-400 text-sm">
                        If you have any questions regarding these Terms and Conditions, please contact us through the contact page on
                        this website.
                    </p>
                </main>
            </div>
        </>
    );
}

