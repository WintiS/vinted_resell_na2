import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import posthog from '../instrumentation-client';

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    useEffect(() => {
        if (!posthog) return;

        const handleRouteChange = (url) => {
            posthog.capture('$pageview', {
                $current_url: url,
            });
        };

        // Track initial page load
        if (typeof window !== 'undefined') {
            handleRouteChange(window.location.pathname + window.location.search);
        }

        // Track subsequent route changes
        router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

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
