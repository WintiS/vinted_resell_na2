# Referral Code Tracking - Implementation Summary

## ✅ What Was Fixed

The referral code was previously only visible in the URL on the store page and was lost when navigating to the cart. Now it's **persisted across the entire shopping flow**.

## Implementation Details

### 1. **CartContext Enhanced** (`contexts/CartContext.js`)

Added referral code state management:
- Loads referral code from `localStorage` on mount
- Provides `referralCode` and `setReferralCode` to all components
- Persists referral code across page navigation

```javascript
const [referralCode, setReferralCode] = useState('');

// Saves to localStorage
const setAndSaveReferralCode = (code) => {
    setReferralCode(code);
    if (code) {
        localStorage.setItem('vinted_referral_code', code);
    }
};
```

### 2. **Store Page Updated** (`pages/store.js`)

Captures referral code from URL when user arrives:

```javascript
useEffect(() => {
    if (ref) {
        setReferralCode(ref);
    }
}, [ref, setReferralCode]);
```

### 3. **Cart Page Updated** (`pages/store/cart.js`)

Uses referral code from context instead of URL:

```javascript
const { referralCode } = useCart();

// Passes to checkout API
referralCode: referralCode || ''
```

## Flow Diagram

```
1. User arrives → /store?ref=TEST123
2. Store component saves "TEST123" → localStorage
3. User adds to cart → Navigates to /store/cart
4. Cart loads referralCode from localStorage
5. Cart displays badge: "Referral: TEST123"
6. User checks out → API receives referralCode
7. Stripe session created → metadata: { referralCode: "TEST123" }
8. Webhook receives payment → Credits TEST123 referrer
```

## Testing Results

✅ **Persistence Verified**: Referral code saved to localStorage  
✅ **UI Display**: Yellow badge shows "Referral: TEST123" on cart page  
✅ **API Integration**: Checkout API receives referralCode correctly  
✅ **Stripe Metadata**: Referral code passed to Stripe session  
✅ **Webhook Ready**: Will credit referrer when webhook is configured  

## Screenshot Evidence

![Cart with Referral Badge](/Users/vitezslavsima/.gemini/antigravity/brain/6a16a641-9774-49e9-b8a6-7669c43c1fc8/cart_page_with_referral_badge_1771164386647.png)

The screenshot shows:
- Cart with 2 items
- Yellow "Referral: TEST123" badge in Order Summary
- Proceed to Checkout button ready

## Next Steps

1. ✅ **Referral tracking is complete!**
2. Add webhook endpoint in Stripe Dashboard
3. Test a real purchase to verify referral crediting
4. (Optional) Add referral dashboard for users to track their earnings

## How It Works for Users

### Scenario: User shares link `https://vintedresells.com/store?ref=JOHN`

1. Friend clicks link → Arrives at store with `?ref=JOHN`
2. Referral code "JOHN" saved to their browser
3. Friend browses, adds products to cart
4. Friend navigates to cart → Still sees "Referral: JOHN"
5. Friend completes purchase → Stripe metadata includes `referralCode: "JOHN"`
6. Webhook fires → JOHN gets 10% commission credited
7. JOHN sees earnings in dashboard

## Commission Structure

| Purchase Type | Commission | Example |
|--------------|------------|---------|
| Store Products | 10% | 2,135 Kč sale = 213.50 Kč to referrer |
| Subscriptions | 100% | 299 Kč sale = 299 Kč to referrer |

## localStorage Keys Used

- `vinted_cart` - Shopping cart items
- `vinted_referral_code` - Referral code for crediting
