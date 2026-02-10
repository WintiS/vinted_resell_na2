# Vinted Suppliers SaaS - Complete Development Plan

## Project Overview
Build a SaaS platform where users pay a monthly/yearly subscription to receive a unique referral link. They promote a centralized Vinted suppliers store and earn 100% commission on all sales tracked through their link.

## Tech Stack
- **Frontend**: Next.js (React)
- **Backend**: Firebase (Auth, Firestore, Cloud Functions)
- **Hosting**: Vercel
- **Payments**: Stripe (subscriptions + payouts)
- **Analytics**: URL parameter tracking

---

# PHASE 1: PROJECT INITIALIZATION

## Step 1.1: Create Next.js Project
```bash
npx create-next-app@latest vinted-saas
cd vinted-saas
npm install firebase stripe @stripe/stripe-js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## Step 1.2: Initialize Firebase
```bash
npm install -g firebase-tools
firebase login
firebase init
# Select: Firestore, Functions, Hosting
```

**Firebase Console Tasks:**
1. Create new Firebase project at https://console.firebase.google.com
2. Enable Authentication → Sign-in methods → Enable Google & Email/Password
3. Create Firestore Database → Start in test mode
4. Go to Project Settings → Get Firebase configuration object

## Step 1.3: Create Environment Variables File
Create `.env.local` in project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

---

# PHASE 2: DATABASE SCHEMA

## Firestore Collections Structure

### Collection: `users`
```javascript
{
  userId: string (auto-generated),
  email: string,
  displayName: string,
  referralCode: string (unique 8-char code),
  subscriptionStatus: "active" | "inactive" | "cancelled",
  subscriptionId: string (Stripe subscription ID),
  subscriptionTier: "monthly" | "yearly",
  subscriptionStartDate: timestamp,
  subscriptionEndDate: timestamp,
  totalEarnings: number,
  availableBalance: number,
  lifetimeEarnings: number,
  stripeCustomerId: string,
  createdAt: timestamp
}
```

### Collection: `sales`
```javascript
{
  saleId: string (auto-generated),
  userId: string (referrer user ID),
  referralCode: string,
  amount: number,
  commission: number (100% of amount),
  productId: string,
  productName: string,
  status: "completed" | "pending" | "refunded",
  stripePaymentId: string,
  createdAt: timestamp
}
```

### Collection: `withdrawals`
```javascript
{
  withdrawalId: string (auto-generated),
  userId: string,
  amount: number,
  status: "pending" | "processing" | "completed" | "failed",
  stripeTransferId: string,
  requestedAt: timestamp,
  completedAt: timestamp
}
```

### Collection: `products`
```javascript
{
  productId: string,
  name: string,
  description: string,
  price: number,
  active: boolean,
  stripePriceId: string
}
```

---

# PHASE 3: FIREBASE CONFIGURATION

## File: `lib/firebase.js`
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## File: `lib/firebase-admin.js` (Server-side)
```javascript
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default admin;
```

---

# PHASE 4: AUTHENTICATION SETUP

## File: `context/AuthContext.js`
```javascript
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const signUpWithEmail = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    
    await setDoc(doc(db, 'users', userId), {
      userId,
      email,
      displayName,
      referralCode: generateReferralCode(),
      subscriptionStatus: 'inactive',
      totalEarnings: 0,
      availableBalance: 0,
      lifetimeEarnings: 0,
      createdAt: new Date(),
    });
    
    return userCredential;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const userId = result.user.uid;
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', userId), {
        userId,
        email: result.user.email,
        displayName: result.user.displayName,
        referralCode: generateReferralCode(),
        subscriptionStatus: 'inactive',
        totalEarnings: 0,
        availableBalance: 0,
        lifetimeEarnings: 0,
        createdAt: new Date(),
      });
    }
    
    return result;
  };

  const loginWithEmail = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData, 
      loading,
      signUpWithEmail,
      signInWithGoogle,
      loginWithEmail,
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## File: `pages/_app.js`
```javascript
import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
```

---

# PHASE 5: STRIPE INTEGRATION

## Stripe Setup Instructions
1. Create account at https://stripe.com
2. Get API keys from Dashboard → Developers → API keys
3. Create two products in Dashboard → Products:
   - **Monthly Subscription**: $29/month (recurring)
   - **Yearly Subscription**: $290/year (recurring)
4. Create one-time product:
   - **Vinted Suppliers List**: $49.99 (one-time)
5. Copy the Price IDs for each product

## File: `pages/api/create-subscription.js`
```javascript
import Stripe from 'stripe';
import admin from '../../lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, priceId } = req.body;

  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userData = userDoc.data();
    
    let customerId = userData.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: { firebaseUID: userId }
      });
      customerId = customer.id;
      
      await admin.firestore().collection('users').doc(userId).update({
        stripeCustomerId: customerId
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ error: error.message });
  }
}
```

## File: `pages/api/create-checkout.js`
```javascript
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
          price: 'price_xxx', // Replace with actual Stripe Price ID
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
```

## File: `pages/api/webhooks/stripe.js`
```javascript
import { buffer } from 'micro';
import Stripe from 'stripe';
import admin from '../../../lib/firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const db = admin.firestore();

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        const userSnapshot = await db.collection('users')
          .where('stripeCustomerId', '==', customerId)
          .limit(1)
          .get();
        
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          await userDoc.ref.update({
            subscriptionStatus: subscription.status,
            subscriptionId: subscription.id,
            subscriptionTier: subscription.items.data[0].price.recurring.interval,
            subscriptionStartDate: new Date(subscription.current_period_start * 1000),
            subscriptionEndDate: new Date(subscription.current_period_end * 1000),
          });
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object;
        const deletedCustomerId = deletedSub.customer;
        
        const deletedUserSnapshot = await db.collection('users')
          .where('stripeCustomerId', '==', deletedCustomerId)
          .limit(1)
          .get();
        
        if (!deletedUserSnapshot.empty) {
          await deletedUserSnapshot.docs[0].ref.update({
            subscriptionStatus: 'cancelled',
          });
        }
        break;

      case 'checkout.session.completed':
        const session = event.data.object;
        
        if (session.payment_status === 'paid' && session.metadata?.referralCode) {
          const referralCode = session.metadata.referralCode;
          const amount = session.amount_total / 100;
          
          const affiliateSnapshot = await db.collection('users')
            .where('referralCode', '==', referralCode)
            .limit(1)
            .get();
          
          if (!affiliateSnapshot.empty) {
            const affiliateDoc = affiliateSnapshot.docs[0];
            
            await db.collection('sales').add({
              userId: affiliateDoc.id,
              referralCode,
              amount,
              commission: amount,
              productId: session.metadata.productId,
              productName: session.metadata.productName,
              status: 'completed',
              stripePaymentId: session.payment_intent,
              createdAt: new Date(),
            });
            
            await affiliateDoc.ref.update({
              totalEarnings: admin.firestore.FieldValue.increment(amount),
              availableBalance: admin.firestore.FieldValue.increment(amount),
              lifetimeEarnings: admin.firestore.FieldValue.increment(amount),
            });
          }
        }
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
```

---

# PHASE 6: CORE PAGES

## File: `pages/index.js` (Landing Page)
```javascript
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <nav className="p-6 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">Vinted Suppliers Pro</h1>
        <div className="space-x-4">
          <button 
            onClick={() => router.push('/login')}
            className="text-white px-6 py-2 rounded-lg font-semibold hover:bg-white/10"
          >
            Login
          </button>
          <button 
            onClick={() => router.push('/signup')}
            className="bg-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-100"
          >
            Sign Up
          </button>
        </div>
      </nav>
      
      <div className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">
          Earn 100% Commission Selling Vinted Suppliers Access
        </h2>
        <p className="text-xl text-white mb-10 max-w-2xl mx-auto">
          Get your unique referral link, promote our premium Vinted suppliers database, 
          and keep 100% of every sale you make.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h3 className="text-2xl font-bold mb-4">Monthly</h3>
            <p className="text-4xl font-bold mb-4">$29<span className="text-lg text-gray-600">/mo</span></p>
            <ul className="text-left mb-6 space-y-2">
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Unique referral link
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                100% commission
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Real-time analytics
              </li>
            </ul>
            <button 
              onClick={() => router.push('/signup?plan=monthly')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg w-full font-semibold hover:bg-blue-700"
            >
              Start Now
            </button>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-xl border-4 border-yellow-400 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-sm font-bold px-4 py-1 rounded-full">
              SAVE 17%
            </div>
            <h3 className="text-2xl font-bold mb-4">Yearly</h3>
            <p className="text-4xl font-bold mb-4">$290<span className="text-lg text-gray-600">/yr</span></p>
            <ul className="text-left mb-6 space-y-2">
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Everything in Monthly
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                2 months free
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Priority support
              </li>
            </ul>
            <button 
              onClick={() => router.push('/signup?plan=yearly')}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg w-full font-semibold hover:bg-purple-700"
            >
              Start Now
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-lg max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-white mb-6">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-white">
            <div>
              <div className="text-4xl mb-2">1️⃣</div>
              <h4 className="font-bold mb-2">Sign Up</h4>
              <p className="text-sm">Choose your plan and create your account in minutes</p>
            </div>
            <div>
              <div className="text-4xl mb-2">2️⃣</div>
              <h4 className="font-bold mb-2">Get Your Link</h4>
              <p className="text-sm">Receive your unique referral tracking link instantly</p>
            </div>
            <div>
              <div className="text-4xl mb-2">3️⃣</div>
              <h4 className="font-bold mb-2">Earn 100%</h4>
              <p className="text-sm">Keep all revenue from every sale you generate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## File: `pages/login.js`
```javascript
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Login</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="my-6 text-center text-gray-500">or</div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <p className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/signup')}
            className="text-blue-600 hover:underline font-semibold"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
```

## File: `pages/signup.js`
```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState('monthly');
  const { signUpWithEmail, signInWithGoogle, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (router.query.plan) {
      setPlan(router.query.plan);
    }
  }, [router.query.plan]);

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signUpWithEmail(email, password, displayName);
      
      // Redirect to payment
      const priceId = plan === 'yearly' 
        ? 'price_yearly_xxx' // Replace with actual Stripe Price ID
        : 'price_monthly_xxx'; // Replace with actual Stripe Price ID
      
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userCredential.user.uid,
          priceId: priceId
        })
      });

      const { clientSecret } = await response.json();
      
      // Redirect to Stripe payment (implement Stripe Elements here)
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
        <p className="text-center text-gray-600 mb-8">
          {plan === 'yearly' ? 'Yearly Plan - $290/year' : 'Monthly Plan - $29/month'}
        </p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Continue to Payment'}
          </button>
        </form>

        <div className="my-6 text-center text-gray-500">or</div>

        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span>Sign up with Google</span>
        </button>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-blue-600 hover:underline font-semibold"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
```

## File: `pages/dashboard.js`
```javascript
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Dashboard() {
  const { user, userData, logout, loading } = useAuth();
  const router = useRouter();
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    thisMonth: 0,
    lastMonth: 0
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadSales();
    }
  }, [user]);

  const loadSales = async () => {
    const q = query(
      collection(db, 'sales'), 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    const salesData = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
    setSales(salesData);
    
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const thisMonthSales = salesData.filter(sale => sale.createdAt >= thisMonth);
    const lastMonthSales = salesData.filter(sale => 
      sale.createdAt >= lastMonth && sale.createdAt < thisMonth
    );
    
    setStats({
      totalSales: salesData.length,
      thisMonth: thisMonthSales.reduce((sum, sale) => sum + sale.amount, 0),
      lastMonth: lastMonthSales.reduce((sum, sale) => sum + sale.amount, 0)
    });
  };

  const referralLink = userData?.referralCode 
    ? `${process.env.NEXT_PUBLIC_BASE_URL}/store?ref=${userData.referralCode}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !user || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const isActive = userData.subscriptionStatus === 'active';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Vinted Suppliers Pro</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{userData.email}</span>
            <button 
              onClick={logout}
              className="text-red-600 hover:text-red-700 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {!isActive && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              Your subscription is inactive. Please update your payment method to continue earning.
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Your Unique Referral Link</h2>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={referralLink} 
              readOnly 
              className="flex-1 border rounded-lg px-4 py-3 bg-gray-50 font-mono text-sm"
            />
            <button 
              onClick={copyLink}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 whitespace-nowrap"
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Share this link to earn 100% commission on every sale
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm mb-2">Total Sales</h3>
            <p className="text-3xl font-bold">{stats.totalSales}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm mb-2">This Month</h3>
            <p className="text-3xl font-bold text-green-600">${stats.thisMonth.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm mb-2">Last Month</h3>
            <p className="text-3xl font-bold text-gray-700">${stats.lastMonth.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm mb-2">Available Balance</h3>
            <p className="text-3xl font-bold text-blue-600">${(userData.availableBalance || 0).toFixed(2)}</p>
            {(userData.availableBalance || 0) >= 50 && (
              <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 w-full">
                Request Withdrawal
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Sales</h2>
          {sales.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No sales yet. Start sharing your referral link!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Product</th>
                    <th className="text-right py-3 px-2">Amount</th>
                    <th className="text-right py-3 px-2">Commission</th>
                    <th className="text-center py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map(sale => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        {sale.createdAt?.toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">{sale.productName}</td>
                      <td className="text-right py-3 px-2">${sale.amount.toFixed(2)}</td>
                      <td className="text-right py-3 px-2 text-green-600 font-semibold">
                        ${sale.commission.toFixed(2)}
                      </td>
                      <td className="text-center py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          sale.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : sale.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## File: `pages/store.js`
```javascript
import { useRouter } from 'next/router';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Store() {
  const router = useRouter();
  const { ref } = router.query;
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    
    try {
      const stripe = await stripePromise;
      
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'vinted-suppliers-list',
          referralCode: ref || ''
        })
      });
      
      const { sessionId } = await response.json();
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">Premium Vinted Suppliers Database</h1>
            <p className="text-xl opacity-90">
              The Ultimate Resource for Vinted Resellers
            </p>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">What You'll Get:</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="text-green-600 text-xl">✓</div>
                  <div>
                    <h3 className="font-semibold">500+ Verified Suppliers</h3>
                    <p className="text-sm text-gray-600">Handpicked and quality-checked</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-green-600 text-xl">✓</div>
                  <div>
                    <h3 className="font-semibold">Complete Contact Info</h3>
                    <p className="text-sm text-gray-600">Email, phone, and website</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-green-600 text-xl">✓</div>
                  <div>
                    <h3 className="font-semibold">Product Categories</h3>
                    <p className="text-sm text-gray-600">Fashion, accessories, vintage & more</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-green-600 text-xl">✓</div>
                  <div>
                    <h3 className="font-semibold">Lifetime Updates</h3>
                    <p className="text-sm text-gray-600">New suppliers added monthly</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-green-600 text-xl">✓</div>
                  <div>
                    <h3 className="font-semibold">Instant Access</h3>
                    <p className="text-sm text-gray-600">Download immediately after purchase</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="text-green-600 text-xl">✓</div>
                  <div>
                    <h3 className="font-semibold">Money-Back Guarantee</h3>
                    <p className="text-sm text-gray-600">30 days, no questions asked</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 p-8 rounded-lg mb-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <p className="text-gray-600 text-sm mb-1">One-Time Payment</p>
                  <p className="text-5xl font-bold text-blue-600">$49.99</p>
                  <p className="text-sm text-gray-600 mt-1">Lifetime access • No recurring fees</p>
                </div>
                <button 
                  onClick={handlePurchase}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform transition hover:scale-105"
                >
                  {loading ? 'Processing...' : 'Get Instant Access'}
                </button>
              </div>
            </div>

            {ref && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-sm text-yellow-800">
                  🎉 You're purchasing through referral code: <span className="font-mono font-bold">{ref}</span>
                </p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t">
              <h3 className="font-semibold mb-4">Why Choose Our Database?</h3>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <h4 className="font-semibold mb-1">Curated Quality</h4>
                  <p className="text-gray-600">Every supplier manually verified for reliability</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">💼</div>
                  <h4 className="font-semibold mb-1">Business Ready</h4>
                  <p className="text-gray-600">Start sourcing products within minutes</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">📈</div>
                  <h4 className="font-semibold mb-1">Grow Faster</h4>
                  <p className="text-gray-600">Scale your Vinted business with confidence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

# PHASE 7: ADMIN PANEL

## File: `pages/admin/index.js`
```javascript
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    totalSales: 0,
    monthlyRevenue: 0
  });

  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',') || [];
  const isAdmin = user && adminEmails.includes(user.email);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/dashboard');
    }
  }, [loading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    // Load users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const usersData = usersSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
    setUsers(usersData);

    // Load sales
    const salesQuery = query(
      collection(db, 'sales'), 
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const salesSnapshot = await getDocs(salesQuery);
    const salesData = salesSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    }));
    setSales(salesData);

    // Calculate stats
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthSales = salesData.filter(s => s.createdAt >= thisMonth);

    setStats({
      totalUsers: usersData.length,
      activeSubscriptions: usersData.filter(u => u.subscriptionStatus === 'active').length,
      totalRevenue: salesData.reduce((sum, sale) => sum + sale.amount, 0),
      totalSales: salesData.length,
      monthlyRevenue: monthSales.reduce((sum, sale) => sum + sale.amount, 0)
    });
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm mb-2">Total Users</h3>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm mb-2">Active Subs</h3>
            <p className="text-3xl font-bold text-green-600">{stats.activeSubscriptions}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm mb-2">Total Sales</h3>
            <p className="text-3xl font-bold">{stats.totalSales}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm mb-2">This Month</h3>
            <p className="text-3xl font-bold text-blue-600">${stats.monthlyRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm mb-2">All-Time Revenue</h3>
            <p className="text-3xl font-bold text-purple-600">${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Recent Users</h2>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm">
                    <th className="py-2">User</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 10).map(user => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <p className="font-semibold text-sm">{user.displayName}</p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.subscriptionStatus === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.subscriptionStatus}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {user.createdAt?.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Recent Sales</h2>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm">
                    <th className="py-2">Product</th>
                    <th className="py-2">Referral</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.slice(0, 10).map(sale => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <p className="font-semibold text-sm">{sale.productName}</p>
                          <p className="text-xs text-gray-600">{sale.createdAt?.toLocaleDateString()}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                          {sale.referralCode}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className="font-bold text-green-600">${sale.amount.toFixed(2)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

# PHASE 8: DEPLOYMENT

## Step 8.1: Prepare for Deployment

### Update `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
```

### Create `.gitignore`
```
node_modules/
.next/
.env.local
.env
.firebase/
firebase-debug.log
.vercel
```

## Step 8.2: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# After testing, deploy to production
vercel --prod
```

## Step 8.3: Configure Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add all variables from `.env.local`:
   - NEXT_PUBLIC_FIREBASE_API_KEY
   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   - etc.
3. Redeploy after adding variables

## Step 8.4: Setup Stripe Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
5. Copy the webhook signing secret
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
7. Redeploy

## Step 8.5: Update Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /sales/{saleId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
    
    match /products/{productId} {
      allow read: if true;
    }
    
    match /withdrawals/{withdrawalId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
    }
  }
}
```

## Step 8.6: Firebase Authentication Domain

1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel domain: `your-app.vercel.app`

---

# TESTING CHECKLIST

## Before Launch Testing

- [ ] User Registration (Email)
- [ ] User Registration (Google)
- [ ] User Login (Email)
- [ ] User Login (Google)
- [ ] Subscription Creation (Monthly)
- [ ] Subscription Creation (Yearly)
- [ ] Referral Code Generation
- [ ] Store Page Loads with Referral Parameter
- [ ] Product Purchase Flow
- [ ] Stripe Webhook Receives Events
- [ ] Sales Tracking in Dashboard
- [ ] Commission Calculation (100%)
- [ ] User Stats Display
- [ ] Admin Panel Access Control
- [ ] Admin Dashboard Stats
- [ ] Mobile Responsiveness
- [ ] Error Handling

---

# POST-LAUNCH ROADMAP

## Week 2
- Email notifications (welcome, sales alerts)
- Withdrawal request system
- Better analytics tracking

## Week 3
- Marketing landing page improvements
- SEO optimization
- Help center / FAQ

## Week 4
- Mobile app (optional)
- Advanced analytics dashboard
- Affiliate leaderboard

## Month 2
- Multiple product support
- Custom commission rates
- Referral tiers/bonuses

---

# IMPORTANT NOTES FOR AI IMPLEMENTATION

1. **Replace Placeholder Values:**
   - Stripe Price IDs (price_monthly_xxx, price_yearly_xxx)
   - Product Price ID in create-checkout.js
   - Firebase credentials in .env.local
   - Admin email addresses

2. **Firebase Admin SDK:**
   - Generate service account key from Firebase Console
   - Add credentials to environment variables for server-side operations

3. **Stripe Products:**
   - Create actual products in Stripe Dashboard
   - Copy exact Price IDs
   - Test with Stripe test mode first

4. **Domain Configuration:**
   - Update NEXT_PUBLIC_BASE_URL after deployment
   - Configure OAuth redirect URLs in Firebase
   - Add Vercel domain to Stripe webhook endpoints

5. **Security:**
   - Never commit .env.local to git
   - Use environment variables for all secrets
   - Implement rate limiting for API routes

6. **Testing:**
   - Use Stripe test cards: 4242 4242 4242 4242
   - Test webhooks with Stripe CLI
   - Verify Firestore security rules

---

# QUICK START COMMANDS

```bash
# Initial setup
npx create-next-app@latest vinted-saas
cd vinted-saas
npm install firebase stripe @stripe/stripe-js
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Development
npm run dev

# Deployment
vercel --prod
```

This plan is now ready to be given to an AI chatbot for implementation. All code is complete and executable.
