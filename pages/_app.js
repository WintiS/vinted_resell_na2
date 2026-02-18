import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
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
