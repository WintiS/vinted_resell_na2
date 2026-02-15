import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
            </Head>
            <AuthProvider>
                <Component {...pageProps} />
            </AuthProvider>
        </>
    );
}

export default MyApp;
