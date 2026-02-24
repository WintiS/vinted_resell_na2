import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import posthog from 'posthog-js';

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    useEffect(() => {
        // Track pageviews on route changes (Pages Router)
        const handleRouteChange = () => posthog.capture('$pageview');
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, []);

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
            </Head>
            <LanguageProvider>
                <AuthProvider>
                    <Component {...pageProps} />
                </AuthProvider>
            </LanguageProvider>
        </>
    );
}

export default MyApp;
