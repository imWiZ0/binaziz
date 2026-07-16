# Complete Moyasar Root Fix - Applied

## 🎯 Problem Summary

**Issue**: Orders were not being created in Medusa because Moyasar webhooks and browser redirects were not properly configured.

**Root Cause**: The MOYASAR_CALLBACK_URL was set to `http://localhost:8000/sa/checkout`, but:
1. The backend was running on port 9000, not 8000
2. The storefront was running on port 8000
3. POST webhooks from Moyasar were hitting the storefront (which doesn't handle POST)
4. GET browser redirects were hitting the backend (which should redirect to storefront)

---

## ✅ Complete Fix Applied

### 1. Fixed Callback URL in .env
**File**: `apps/backend/.env`

Changed:
```env
MOYASAR_CALLBACK_URL=http://localhost:8000/sa/checkout
```

To:
```env
MOYASAR_CALLBACK_URL=http://localhost:9000/sa/checkout
```

**Why**: The backend runs on port 9000 (Medusa default), not 8000. The callback URL must point to the backend which can handle both POST (webhooks) and GET (browser redirects).

---

### 2. Created Backend Route for /sa/checkout
**File**: `apps/backend/src/api/hooks/sa/checkout/route.ts`

This route handles **both** POST (webhooks) and GET (browser redirects):

#### POST Handler (Webhooks from Moyasar)
- Verifies the webhook signature
- Processes the payment through Medusa's workflow
- Updates payment session status to "paid"
- Logs all steps with `[MOYASAR]` prefix

#### GET Handler (Browser Redirects from Moyasar)
- Receives browser redirects with `?status=paid`
- Redirects to the storefront at `http://localhost:8000/sa/checkout?status=paid`
- The storefront's dynamic route `/[countryCode]/checkout/page.tsx` handles the rest with `countryCode="sa"`

---

### 3. Added Debug Logging to Frontend
**File**: `apps/storefront/src/lib/data/cart.ts`

Added comprehensive `[DEBUG]` logging to the `placeOrder()` function:
- Cart ID being used
- Request headers (including auth token)
- Cart completion success/failure
- Response type and order details
- Redirect information

This allows you to track exactly what's happening when orders are placed.

---

### 4. OTO Provider Fixes (Still Applied)
All the previous OTO fixes remain in place:
- `apps/backend/src/providers/fulfillment/oto/oto-provider.ts` - Error handling, validation, logging
- `apps/backend/src/providers/fulfillment/oto/oto-api-service.ts` - Error handling, env validation
- `apps/backend/src/migration-scripts/initial-data-seed.ts` - Fixed provider_id from `redbox_default` to `oto`

---

## 🔄 Complete Flow (After Fix)

### Browser Flow (User Experience)
```
1. User clicks "Pay with Moyasar"
   ↓
2. Frontend calls initiatePaymentSession()
   ↓
3. Moyasar provider creates payment with:
   - callback_url = http://localhost:9000/sa/checkout
   - payment_url = https://api.moyasar.com/... (Moyasar's payment page)
   ↓
4. Frontend redirects user to payment_url
   ↓
5. User completes payment on Moyasar
   ↓
6. Moyasar redirects browser to: http://localhost:9000/sa/checkout?status=paid
   ↓
7. Backend receives GET /sa/checkout?status=paid
   ↓
8. Backend redirects to: http://localhost:8000/sa/checkout?status=paid
   ↓
9. Storefront receives request at /sa/checkout?status=paid
   ↓
10. Storefront matches dynamic route [countryCode]/checkout with countryCode="sa"
    ↓
11. Checkout page sees status="paid" and calls placeOrder()
    ↓
12. placeOrder() calls cart.complete()
    ↓
13. Medusa creates order and triggers OTO fulfillment
    ↓
14. User redirected to /sa/order/order_xxx/confirmed
```

### Webhook Flow (Server-to-Server)
```
1. Moyasar processes payment
   ↓
2. Moyasar sends POST webhook to: http://localhost:9000/sa/checkout
   ↓
3. Backend receives POST /sa/checkout
   ↓
4. Backend verifies signature
   ↓
5. Backend processes payment workflow
   ↓
6. Payment session marked as "paid" in Medusa
   ↓
7. When user's browser reaches step 9 above, cart.complete() succeeds
```

---

## 🧪 Testing Instructions

### Step 1: Restart Both Servers
```bash
# Terminal 1: Backend (port 9000)
cd apps/backend
npm run dev

# Terminal 2: Storefront (port 8000)
cd apps/storefront
npm run dev
```

### Step 2: Place a Test Order
1. Add items to your cart
2. Go to checkout
3. Select Moyasar as payment method
4. Click "Pay with Moyasar"
5. Complete payment on Moyasar's test payment page
6. Moyasar will redirect you back

### Step 3: Check Logs

#### Backend Terminal (port 9000)
```
[MOYASAR] Webhook received at /sa/checkout (POST)
[MOYASAR] Webhook action: authorize
[MOYASAR] Processing payment workflow...
[MOYASAR] Webhook processed successfully

[MOYASAR] Browser redirect received at /sa/checkout (GET) with status: paid

[DEBUG] Placing order for cart: cart_xxxxx
[DEBUG] Cart complete SUCCESS: { type: "order", order: { id: "order_xxx" } }
[DEBUG] Redirecting to confirmation for order: order_xxx
[OTO] Creating fulfillment for order: order_xxx
[OTO] API response: { order_id: "oto_xxx", ... }
```

#### Storefront Terminal (port 8000)
No special logs needed - the checkout page handles the redirect automatically.

---

## 📋 Verification Checklist

- [ ] Backend running on port 9000
- [ ] Storefront running on port 8000
- [ ] MOYASAR_CALLBACK_URL set to `http://localhost:9000/sa/checkout`
- [ ] Backend route exists at `/api/hooks/sa/checkout` (handles POST and GET)
- [ ] Debug logs added to `placeOrder()`
- [ ] OTO provider fixes still in place
- [ ] Test order placed successfully
- [ ] Webhook received and processed (check backend logs)
- [ ] Browser redirect handled (check backend logs)
- [ ] Order created in Medusa
- [ ] Order appears in admin dashboard
- [ ] Order appears in user account
- [ ] OTO fulfillment created (check `[OTO]` logs)

---

## 🐛 Debugging Guide

### Issue: No webhook received
**Check**:
1. Backend logs for `[MOYASAR] Webhook received`
2. Moyasar dashboard webhook configuration
3. Network connectivity (can Moyasar reach your backend?)
4. Try testing with a tool like ngrok for local development

**Fix**:
- Ensure Moyasar's webhook URL is set to `http://localhost:9000/sa/checkout`
- Or use a tool like ngrok: `https://your-ngrok-url.ngrok.io/sa/checkout`

### Issue: Browser redirect not working
**Check**:
1. Backend logs for `[MOYASAR] Browser redirect received`
2. Browser's network tab for the redirect
3. Final URL after redirect (should be `http://localhost:8000/sa/checkout?status=paid`)

**Fix**:
- Verify the GET handler in `/api/hooks/sa/checkout/route.ts` is redirecting correctly
- Check that port 8000 (storefront) is running

### Issue: Order not created
**Check**:
1. Backend logs for `[DEBUG] Cart complete`
2. If you see `FAILED`, check the error message
3. Verify the payment session was marked as paid

**Fix**:
- Check that webhook was received and processed first
- Verify the payment session status in the database

### Issue: Confirmation page appears but no order
**Check**:
1. Browser URL on confirmation page (should have real order ID, not `undefined`)
2. Backend logs for `[DEBUG] Order ID: order_xxx`
3. Database: Run `SELECT * FROM order_ WHERE id = 'order_xxx'`

**Fix**:
- If order ID is `undefined`, the cart.complete() call failed
- Check the error in the `[DEBUG] Cart complete FAILED` log

---

## 🎉 Expected Result

After all these fixes:

✅ **Webhooks are received and processed** (POST to backend)  
✅ **Browser redirects work** (GET to backend, forwarded to storefront)  
✅ **Orders are created in Medusa**  
✅ **Orders appear in admin dashboard**  
✅ **Orders appear in user account**  
✅ **OTO fulfillment is created**  
✅ **Full debug visibility**  

---

## 📝 Files Modified

```
apps/backend/
├── .env                                    (MOYASAR_CALLBACK_URL port fix)
└── src/api/hooks/sa/checkout/
    └── route.ts                         (POST + GET handlers)

apps/storefront/
└── src/lib/data/
    └── cart.ts                         (Debug logging)

apps/backend/
├── src/providers/fulfillment/oto/
│   ├── oto-provider.ts                  (Error handling, validation)
│   └── oto-api-service.ts               (Error handling, env validation)
└── src/migration-scripts/
    └── initial-data-seed.ts             (Provider ID fixes)
```

---

## 📞 Support

If you're still having issues:

1. **Check all logs** for `[MOYASAR]` and `[DEBUG]` messages
2. **Verify both servers are running** (backend on 9000, storefront on 8000)
3. **Test the webhook manually**:
   ```bash
   curl -X POST http://localhost:9000/sa/checkout \
     -H "Content-Type: application/json" \
     -H "x-moyasar-signature: sha256=..." \
     -d '{"id":"test","status":"paid","amount":1000,...}'
   ```
4. **Test the browser redirect manually**:
   - Open your browser to: `http://localhost:9000/sa/checkout?status=paid`
   - You should be redirected to: `http://localhost:8000/sa/checkout?status=paid`

---

**Status**: ✅ All changes applied and ready for testing
**Date**: 2026-07-14
**Fixed by**: Mistral Vibe
