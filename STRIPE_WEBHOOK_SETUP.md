# Stripe Webhook Setup Guide

## 🚀 Three Ways to Test Webhooks Locally

You're right - Stripe webhooks need to be publicly accessible. Here are your options:

---

## ✅ **OPTION 1: Stripe CLI (RECOMMENDED)**

The official Stripe solution - creates a secure tunnel from Stripe to localhost.

### Installation

**On Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**On Windows/Linux:**
Download from: https://stripe.com/docs/stripe-cli

### Usage

1. **Login to Stripe:**
```bash
stripe login
```
This will open a browser to authenticate with your Stripe account.

2. **Start webhook forwarding:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This command will:
- ✅ Create a webhook endpoint on Stripe
- ✅ Forward all webhooks to your localhost
- ✅ Give you a webhook signing secret (starts with `whsec_`)

3. **Copy the webhook secret:**
Look for output like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

4. **Update `.env.local`:**
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

5. **Keep it running!**
Leave the terminal window open while testing. Every webhook event will show up here.

### Test a Subscription
```bash
# In another terminal, trigger a test payment:
stripe trigger payment_intent.succeeded
```

### Pros ✅
- Official Stripe tool
- Secure
- Shows webhook events in terminal
- Can trigger test events
- Free

### Cons ❌
- Need to keep terminal open
- Need to reinstall if you restart computer

---

## ✅ **OPTION 2: ngrok (Popular Alternative)**

Creates a public URL that tunnels to your localhost.

### Installation

**On Mac:**
```bash
brew install ngrok
```

**Or download from:** https://ngrok.com/download

### Usage

1. **Sign up at ngrok.com** (free tier is fine)

2. **Authenticate:**
```bash
ngrok authtoken YOUR_AUTH_TOKEN
```

3. **Start tunnel:**
```bash
ngrok http 3000
```

4. **Copy the public URL:**
ngrok will show something like:
```
Forwarding  https://abc123.ngrok.io -> http://localhost:3000
```

5. **Add webhook in Stripe Dashboard:**
- Go to: https://dashboard.stripe.com/webhooks
- Click "Add endpoint"
- Enter: `https://abc123.ngrok.io/api/webhooks/stripe`
- Select events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `checkout.session.completed`

6. **Get Webhook Signing Secret:**
- Click on your new webhook endpoint
- Click "Reveal" under "Signing secret"
- Copy it

7. **Update `.env.local`:**
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Pros ✅
- Easy to use
- Works with any service (not just Stripe)
- Get a public URL to share

### Cons ❌
- Free tier has limitations (connection time limit)
- URL changes every time you restart
- Need to update Stripe dashboard each time

---

## ✅ **OPTION 3: Deploy to Vercel (Production-Ready)**

Best for final testing before launch.

### Quick Vercel Deployment

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **Add Environment Variables:**
In Vercel dashboard, add all your `.env.local` variables.

5. **Get your production URL:**
Something like: `https://your-app.vercel.app`

6. **Add webhook in Stripe:**
- URL: `https://your-app.vercel.app/api/webhooks/stripe`
- Select the same events as above
- Get the signing secret
- Add it to Vercel environment variables

### Pros ✅
- Real production environment
- Permanent URL
- Fast deployment
- Free tier available

### Cons ❌
- Need to redeploy for code changes
- Not ideal for rapid testing

---

## 📋 **Step-by-Step: Recommended Workflow**

### For Development (Use Stripe CLI):

```bash
# Terminal 1: Start your Next.js app
npm run dev

# Terminal 2: Start Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: Test events
stripe trigger customer.subscription.created
```

### For Production (Use Vercel):

```bash
# Deploy to Vercel
vercel --prod

# Add webhook in Stripe dashboard with your Vercel URL
# Test with real payment
```

---

## 🔧 **Complete Setup Commands**

Here's what to run right now:

### 1. Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
```

### 2. Login:
```bash
stripe login
```

### 3. Start forwarding (keep this running):
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 4. Update .env.local with the secret it gives you:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 5. Restart your dev server:
```bash
# Ctrl+C in the npm run dev terminal
npm run dev
```

### 6. Test it:
```bash
# In a new terminal
stripe trigger customer.subscription.created
```

You should see webhook events in the Stripe CLI terminal! ✨

---

## 🧪 **Testing Your Webhook**

### Check if it's working:

1. **Look at Stripe CLI output** - you'll see webhook events
2. **Check your Next.js terminal** - you'll see console.logs from the webhook handler
3. **Check Firestore** - user subscription status should update

### Sample Stripe CLI Output:
```
2024-02-13 21:30:15   --> customer.subscription.created [evt_xxxxx]
2024-02-13 21:30:15   <-- [200] POST http://localhost:3000/api/webhooks/stripe
```

### Sample Next.js Terminal Output:
```
Received webhook event: customer.subscription.created
Updating subscription for customer: cus_xxxxx
✅ Subscription updated successfully
```

---

## 🔐 **Important Security Notes**

### For Development:
- `stripe listen` gives you a **test mode** webhook secret (starts with `whsec_test_`)
- This is safe for development
- Don't commit this secret to git

### For Production:
- Use a **live mode** webhook secret from Stripe dashboard
- Add it to Vercel environment variables (not in code)
- Different secret for each environment (dev/staging/prod)

---

## 🎯 **Quick Start (Copy & Paste)**

```bash
# 1. Install Stripe CLI
brew install stripe/stripe-cli/stripe

# 2. Login
stripe login

# 3. Start listening (this will give you a webhook secret)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Then:
1. Copy the `whsec_xxxxx` secret it shows
2. Add to `.env.local` as `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`
3. Restart `npm run dev`
4. Test with: `stripe trigger customer.subscription.created`

---

## 💡 **Pro Tips**

### 1. See all webhook events:
```bash
stripe listen --print-json
```

### 2. Forward only specific events:
```bash
stripe listen \
  --events customer.subscription.created,customer.subscription.updated \
  --forward-to localhost:3000/api/webhooks/stripe
```

### 3. Test subscription flow:
```bash
# Create a subscription
stripe trigger customer.subscription.created

# Update it
stripe trigger customer.subscription.updated

# Delete it
stripe trigger customer.subscription.deleted
```

### 4. Debug webhook issues:
Check Stripe dashboard → Developers → Webhooks → Your endpoint → Logs

---

## ❓ **Common Issues**

### "Webhook signature verification failed"
- ✅ Make sure `STRIPE_WEBHOOK_SECRET` matches the one from `stripe listen`
- ✅ Restart your Next.js server after updating `.env.local`

### "Connection refused"
- ✅ Make sure `npm run dev` is running on port 3000
- ✅ Check that webhook URL is `localhost:3000/api/webhooks/stripe`

### "No webhook events showing up"
- ✅ Keep `stripe listen` terminal window open
- ✅ Make sure you're testing in the same Stripe account you logged into

---

## 🚀 **Ready to Go?**

Run these commands now:

```bash
# In a new terminal:
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Let me know when you see the webhook secret, and I'll help you test it! 🎉
