# 🚀 Vinted Suppliers SaaS Platform

A modern, full-stack SaaS platform built with Next.js, Firebase, and Stripe. Users subscribe to receive unique referral links and earn 100% commission on sales they generate.

![Platform](https://img.shields.io/badge/Platform-Next.js-black)
![Auth](https://img.shields.io/badge/Auth-Firebase-orange)
![Payment](https://img.shields.io/badge/Payment-Stripe-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 🔐 Authentication
- Email/Password authentication
- Google OAuth integration
- Real-time user session management
- Automatic user profile creation

### 💳 Subscription Management
- Monthly ($29/mo) and Yearly ($290/yr) plans
- Stripe-powered secure payments
- Automatic subscription status updates
- Real-time sync with Firebase

### 📊 User Dashboard
- Personalized analytics dashboard
- Unique referral link generation
- Sales tracking and commission monitoring
- Real-time earnings updates
- Withdrawal requests (≥ $50)

### 🎯 Referral System
- Automatic unique code generation
- 100% commission on referred sales
- Complete transaction tracking
- Referral link sharing and copying

### 👑 Admin Panel
- Comprehensive user management
- Sales and revenue analytics
- Monthly performance tracking
- User subscription status monitoring

### 🎨 Modern Dark Theme
- Beautiful gradient designs
- Material Icons integration
- Responsive layouts
- Smooth animations and transitions

---

## 🛠 Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Backend**: Firebase (Auth + Firestore)
- **Payments**: Stripe (Subscriptions + One-time payments)
- **Hosting**: Vercel (recommended)
- **Database**: Cloud Firestore
- **Analytics**: Built-in dashboard

---

## 📂 Project Structure

```
vinted_resell_na2/
├── pages/
│   ├── api/
│   │   ├── create-subscription.js    # Stripe subscription creation
│   │   ├── create-checkout.js        # Product checkout
│   │   └── webhooks/
│   │       └── stripe.js             # Stripe webhook handler
│   ├── admin/
│   │   └── index.js                  # Admin dashboard
│   ├── _app.js                       # App wrapper with AuthProvider
│   ├── index.js                      # Landing page
│   ├── login.js                      # Login page
│   ├── signup.js                     # Signup page
│   ├── dashboard.js                  # User dashboard
│   ├── pricing.js                    # Pricing/subscription page
│   ├── store.js                      # Product store page
│   └── success.js                    # Payment success page
├── context/
│   └── AuthContext.js                # Authentication context
├── lib/
│   ├── firebase.js                   # Firebase client config
│   ├── firebase-admin.js             # Firebase Admin SDK
│   ├── email.js                      # Email sending (Resend)
│   ├── utils.js                      # Utility functions
│   └── constants.js                  # App constants
├── styles/
│   └── globals.css                   # Global styles + Tailwind
├── .env.local                        # Environment variables
├── .env.example                      # Environment template
├── IMPLEMENTATION_STATUS.md          # Setup guide
└── OPTIMIZATION_SUMMARY.md           # Optimization details
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase project created
- Stripe account set up

### 1. Clone and Install
```bash
cd vinted_resell_na2
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env.local` and fill in your credentials:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... (see .env.example for all variables)

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev  # Optional: Use your verified domain email

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com
```

### Twilio (SMS admin notifications)
This project can send an SMS to the admin phone number when a user requests a withdrawal.

Add these to `.env.local` (and to Vercel Project Settings → Environment Variables for production):

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_FROM=+1xxxxxxxxxx

# Admin phone to receive the SMS (E.164 recommended). If omitted, defaults to +420737536910.
ADMIN_PHONE=+420737536910
```

### 3. Set Up Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Enable **Email/Password** and **Google** authentication
3. Create a **Firestore database** (start in test mode)
4. Download **Service Account** JSON
5. Add credentials to `.env.local`

### 4. Set Up Stripe
1. Create subscription products in [Stripe Dashboard](https://dashboard.stripe.com/products)
   - Monthly: $29/month
   - Yearly: $290/year
2. Copy the Price IDs
3. Update `/pages/pricing.js` with your Price IDs
4. Set up webhook endpoint: `http://localhost:3000/api/webhooks/stripe`
5. Add webhook secret to `.env.local`

### 5. Set Up Email (Resend)
1. Create account at [Resend](https://resend.com/)
2. Get your API key from the dashboard
3. Add `RESEND_API_KEY` to `.env.local`
4. (Optional) Verify your domain and set `RESEND_FROM_EMAIL` to use your custom domain

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📖 Documentation

- **[IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md)** - Complete setup guide
- **[OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md)** - Code optimizations
- **[vinted-saas-development-plan_1.md](./vinted-saas-development-plan_1.md)** - Full development plan

---

## 🔑 Key Features Explained

### Real-Time Updates
User data automatically syncs using Firestore's `onSnapshot`:
```javascript
const { userData } = useAuth();
// userData updates automatically when subscription changes!
```

### No Firestore Indexes Required
Optimized queries work without creating indexes:
```javascript
// Simple query + client-side sorting
query(collection(db, 'sales'), where('userId', '==', uid))
```

### Centralized Configuration
All constants in one place:
```javascript
import { SUBSCRIPTION_PLANS, ROUTES } from './lib/constants';
```

### Utility Functions
Common operations made easy:
```javascript
import { formatCurrency, copyToClipboard } from './lib/utils';
```

---

## 🧪 Testing

### Test Authentication
1. Visit http://localhost:3000
2. Click "Sign Up"
3. Create account with email or Google
4. Verify dashboard access

### Test with Stripe Test Cards
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### Test Webhooks Locally
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 🌐 Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel Dashboard
# Then deploy to production
vercel --prod
```

### Post-Deployment
1. Add production URL to Firebase authorized domains
2. Update Stripe webhook endpoint URL
3. Update `NEXT_PUBLIC_BASE_URL` in environment variables

---

## 👥 User Roles

### Regular Users
- Create account and subscribe
- Receive unique referral link
- Track sales and earnings
- Request withdrawals

### Admin Users
- Access admin dashboard at `/admin`
- View all users and subscriptions
- Monitor sales and revenue
- Track platform metrics

**Set admin email in `.env.local`:**
```env
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

---

## 🔒 Security

- ✅ Environment variables for sensitive data
- ✅ Firebase Admin SDK for server-side operations
- ✅ Stripe webhook signature verification
- ✅ Input validation on all API endpoints
- ✅ Firestore security rules
- ✅ Authentication required for protected routes

---

## 📊 Database Schema

### Users Collection
```javascript
{
  userId: string,
  email: string,
  displayName: string,
  referralCode: string, // Unique 8-char code
  subscriptionStatus: 'active' | 'inactive' | 'cancelled',
  totalEarnings: number,
  availableBalance: number,
  stripeCustomerId: string,
  createdAt: timestamp
}
```

### Sales Collection
```javascript
{
  userId: string,
  referralCode: string,
  amount: number,
  commission: number,
  productName: string,
  status: 'completed' | 'pending' | 'refunded',
  createdAt: timestamp
}
```

---

## 🎯 Roadmap

- [x] Email notifications (purchase confirmations)
- [ ] Withdrawal processing automation
- [ ] Advanced analytics dashboard
- [ ] Marketing materials and training
- [ ] Mobile app (React Native)
- [ ] Multi-currency support
- [ ] Team/agency features

---

## 🐛 Troubleshooting

### Firebase Errors
- Ensure authentication methods are enabled
- Check Firestore security rules
- Verify service account credentials

### Stripe Errors
- Use test mode during development
- Check webhook secret is correct
- Verify Price IDs match Stripe products

### Build Errors
- Clear `.next` folder and rebuild
- Check all environment variables are set
- Ensure Node.js version is 18+

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🤝 Support

For issues or questions:
1. Check documentation files
2. Review error logs in browser console
3. Test with Stripe test mode first
4. Verify Firebase configuration

---

## 🎉 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Stripe](https://stripe.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Material Icons](https://fonts.google.com/icons)

---

**Made with ❤️ for the Vinted reseller community**
