# Vercel Deployment Troubleshooting Guide

## Issue: Checkout Works on Localhost but Not on Vercel

### Common Causes:
1. ❌ Missing or incorrect environment variables in Vercel
2. ❌ Wrong Stripe API keys (test vs. live)
3. ❌ BASE_URL pointing to localhost instead of production domain
4. ❌ Serverless function timeout
5. ❌ CORS issues

---

## ✅ Step-by-Step Fix

### 1. Verify All Environment Variables in Vercel

Go to **Vercel Dashboard** → Your Project → Settings → Environment Variables

**Required Variables:**

#### Stripe Variables (CRITICAL)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SeIpnK0Js68kvLk...
STRIPE_SECRET_KEY=sk_test_51SeIpnK0Js68kvLk...
STRIPE_WEBHOOK_SECRET=whsec_8pfOzB2DwAXzg5gP27EhZbAPyYXFSswA
```

#### Application Config
```
NEXT_PUBLIC_BASE_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_ADMIN_EMAILS=kviteksima@seznam.cz
```

#### Firebase Config (Public - Frontend)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDk-XD_3DCqboujrL02wPvXK0y1uYeoF1o
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=vintedna2.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=vintedna2
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=vintedna2.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=973620315358
NEXT_PUBLIC_FIREBASE_APP_ID=1:973620315358:web:30b92b0e273efe7181ae4f
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-ZSL2F1CQBF
```

#### Firebase Admin (Server-side)
```
FIREBASE_PROJECT_ID=vintedna2
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@vintedna2.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkq...
```

**NOTE:** The `FIREBASE_PRIVATE_KEY` must use `\n` (actual newline characters), not `\\n` (escaped). Vercel handles this automatically.

---

### 2. Check Which Variables Are Missing

Add this debug endpoint to verify environment variables are loaded:

**File:** `pages/api/debug-env.js`

```javascript
export default function handler(req, res) {
    // Only allow in development or with a secret key
    if (process.env.NODE_ENV === 'production' && req.query.secret !== 'YOUR_SECRET_HERE') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    res.status(200).json({
        hasStripePublishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        hasBaseUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
        hasFirebaseAdmin: !!process.env.FIREBASE_PRIVATE_KEY,
        nodeEnv: process.env.NODE_ENV,
    });
}
```

**Test it:**
- Local: `http://localhost:3000/api/debug-env`
- Vercel: `https://your-domain.vercel.app/api/debug-env?secret=YOUR_SECRET_HERE`

---

### 3. Add Better Error Logging

Update your checkout endpoints to log errors properly:

**File:** `pages/api/store-checkout.js`

Add this at the top of the catch block:

```javascript
catch (error) {
    console.error('Checkout error details:', {
        message: error.message,
        stack: error.stack,
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    });
    res.status(500).json({ error: error.message });
}
```

Then check **Vercel Logs**:
- Go to Vercel Dashboard → Your Project → Deployments → [Latest] → Functions
- Look for the `/api/store-checkout` function logs
- You'll see the exact error message

---

### 4. Most Likely Issues & Fixes

#### Issue A: `STRIPE_SECRET_KEY` is missing
**Error:** "No API key provided" or "Invalid API key"
**Fix:** Add `STRIPE_SECRET_KEY` in Vercel environment variables

#### Issue B: `NEXT_PUBLIC_BASE_URL` still points to localhost
**Error:** CORS error or redirect issues
**Fix:** Set to your Vercel domain: `https://your-app.vercel.app`

#### Issue C: Environment variables not applied
**Fix:** 
1. Save variables in Vercel
2. Redeploy (variables only apply to NEW deployments)
3. Go to Deployments → Click "..." → Redeploy

#### Issue D: Stripe key is for wrong environment
**Error:** "No such price" (even with dynamic pricing)
**Fix:** Verify you're using **test** keys on test site, **live** keys on production

---

### 5. Quick Verification Checklist

```bash
# 1. Check Vercel environment variables
✓ Go to Vercel Dashboard → Settings → Environment Variables
✓ Verify all 14 variables are set
✓ Check NEXT_PUBLIC_BASE_URL matches your domain

# 2. Redeploy after adding variables
✓ Go to Deployments
✓ Click "..." on latest deployment
✓ Click "Redeploy"

# 3. Test the debug endpoint
✓ Visit https://your-domain.vercel.app/api/debug-env?secret=YOUR_SECRET
✓ All should return true except maybe webhook secret

# 4. Check Vercel function logs
✓ Go to Deployments → [Latest] → Functions
✓ Click on /api/store-checkout
✓ Look for error details in logs

# 5. Test checkout
✓ Add item to cart
✓ Click checkout
✓ If error, check browser console for the exact error message
```

---

### 6. Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "No checkout URL returned" | Stripe API failed silently | Check Vercel logs for actual error |
| "No API key provided" | Missing STRIPE_SECRET_KEY | Add to Vercel env vars |
| "Invalid API key" | Wrong Stripe key format | Copy from Stripe dashboard again |
| "No such customer" | Using test key with live data | Use matching key type |
| CORS error | BASE_URL mismatch | Update NEXT_PUBLIC_BASE_URL |
| Function timeout | Free plan 10s limit | Optimize or upgrade plan |

---

### 7. Test Locally vs Production

**Local env (.env.local):**
```bash
NEXT_PUBLIC_BASE_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
```

**Vercel env (Production):**
```bash
NEXT_PUBLIC_BASE_URL=https://vintedresells.vercel.app
STRIPE_SECRET_KEY=sk_test_...  # Or sk_live_ for production
```

**IMPORTANT:** After changing environment variables in Vercel, you MUST redeploy for them to take effect!

---

## Next Steps

1. ✅ Verify all environment variables in Vercel
2. ✅ Make sure `NEXT_PUBLIC_BASE_URL` is set to your Vercel domain
3. ✅ Redeploy your application
4. ✅ Add the debug endpoint to check variables are loaded
5. ✅ Check Vercel function logs for the actual error
6. ✅ Report back with the error message from logs
