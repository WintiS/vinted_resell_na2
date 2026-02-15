# Stripe Webhook Setup Guide

## What Was Implemented

Your webhook at `/api/webhooks/stripe.js` now handles:

✅ **Referral Commission** - Credits 10% of store sales to the referrer  
✅ **Product Access** - Grants buyer access to purchased products  
✅ **Purchase Recording** - Logs all purchases in Firebase  
✅ **Multi-product Support** - Handles cart with multiple items  

## How to Configure in Stripe Dashboard

### Step 1: Add Webhook Endpoint

1. Go to **Stripe Dashboard** → Developers → Webhooks
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   - **Local Testing**: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe`
   - **Production**: `https://vintedresells.com/api/webhooks/stripe`
   
4. Select events to listen to:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`  
   - ✅ `customer.subscription.deleted`

5. Click **"Add endpoint"**

### Step 2: Copy Webhook Secret

After creating the endpoint, Stripe will show you a **webhook signing secret** (starts with `whsec_`).

1. Copy this secret
2. Add it to your `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

### Step 3: Test Locally with Stripe CLI (Optional)

If you want to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward events to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a temporary webhook secret to use in `.env.local` for testing.

### Step 4: Test with Real Purchase

1. Make a test purchase through your store with a referral code
2. Monitor the webhook in Stripe Dashboard → Developers → Webhooks → [Your endpoint]
3. Check if events are being received successfully
4. Verify in Firebase that:
   - User's earnings were updated
   - Product access was granted
   - Purchase was recorded

## Commission Structure

| Type | Commission Rate | Example |
|------|----------------|---------|
| Store Products | 10% | 1,281 Kč sale = 128.10 Kč commission |
| Subscriptions | 100% | 299 Kč sale = 299 Kč commission |

You can adjust the commission rate in `/api/webhooks/stripe.js` line 116:
```javascript
const commissionRate = productIds ? 0.10 : 1.0; // Change 0.10 to your desired rate
```

## Database Collections Created

### `sales`
Records each referral sale with commission details.

### `userProducts`  
Grants user access to purchased products.

### `purchases`
Complete purchase history.

## Monitoring

View webhook logs in:
- **Stripe Dashboard** → Developers → Webhooks → [Endpoint] → Recent attempts
- **Server logs** - Check your server console for detailed logs

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Webhook signature error | Verify `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard |
| Events not received | Check webhook URL is publicly accessible |
| Commission not credited | Verify user has `referralCode` field in database |
| Product access not granted | Verify buyer exists in `users` collection with matching email |

## Security Notes

✅ Webhook signature verification is enabled  
✅ Only processes `paid` sessions  
✅ Uses Firebase admin for server-side operations  
✅ Logs all errors without exposing sensitive data  
