# Moyasar Callback URL Fix - Applied Changes

## ✅ Changes Made

### 1. Fixed Callback URL in .env
**File**: `apps/backend/.env`

Changed:
```env
MOYASAR_CALLBACK_URL=http://localhost:8000/sa/checkout
```

To:
```env
MOYASAR_CALLBACK_URL=http://localhost:8000/checkout
```

### 2. Added Debug Logging to placeOrder
**File**: `apps/storefront/src/lib/data/cart.ts`

Added comprehensive console logging to track the order creation flow:
- Cart ID being used
- Request headers
- Cart completion success/failure
- Response type and order details
- Redirect information

### 3. Created Fallback Route (Optional)
**File**: `apps/backend/src/api/hooks/sa/checkout/route.ts`

Created a forwarding route that redirects `/sa/checkout` to the Moyasar webhook handler at `/moyasar`. This ensures backward compatibility if any systems are still using the old callback URL.

---

## 🎯 What Was Fixed

### The Root Cause
Moyasar was trying to POST webhook notifications to `http://localhost:8000/sa/checkout`, but this route didn't exist in your application. This caused:

1. **Webhook failures**: Moyasar couldn't notify your backend that payment was successful
2. **Payment sessions stuck**: Payment sessions remained in "pending" state
3. **Cart completion failures**: `cart.complete()` would fail because payment wasn't authorized
4. **No order creation**: Orders were never created in the database
5. **False confirmation page**: The frontend would still redirect to confirmation page (due to URL parameter), but no actual order existed

### The Flow (Before Fix)
```
User pays on Moyasar
↓
Moyasar POSTs to /sa/checkout → 404 NOT FOUND ❌
↓
Moyasar redirects user to /checkout?status=paid
↓
Frontend calls placeOrder()
↓
placeOrder() calls cart.complete()
↓
cart.complete() FAILS (payment not authorized) ❌
↓
Error is swallowed or redirect happens anyway
↓
Confirmation page appears (but order doesn't exist) ❌
```

### The Flow (After Fix)
```
User pays on Moyasar
↓
Moyasar POSTs to /checkout ✅
↓
Moyasar webhook handler processes payment
↓
Payment session marked as "paid" in Medusa ✅
↓
Moyasar redirects user to /checkout?status=paid
↓
Frontend calls placeOrder()
↓
placeOrder() calls cart.complete()
↓
cart.complete() SUCCEEDS (payment is authorized) ✅
↓
Order created in Medusa ✅
↓
OTO fulfillment created ✅
↓
Confirmation page appears with real order data ✅
```

---

## 🧪 Testing Instructions

### Step 1: Restart Your Backend
```bash
cd apps/backend
npm run dev
```

Make sure the environment variable change is picked up.

### Step 2: Place a Test Order
1. Add items to your cart
2. Go to checkout
3. Select Moyasar as payment method
4. Complete the payment on Moyasar's page
5. Moyasar will redirect back to your store

### Step 3: Check the Logs
Watch your backend console for these messages:

#### Webhook Processing (Should appear first)
```
[MOYASAR] Received webhook at /checkout
[MOYASAR] Verify signature...
[MOYASAR] Processing payment workflow...
[MOYASAR] Payment session updated
```

#### Order Creation (Should appear after)
```
[DEBUG] Placing order for cart: cart_xxxxxxxxx
[DEBUG] Headers: {"authorization":"Bearer ..."}
[DEBUG] Cart complete SUCCESS: {
  "type": "order",
  "order": {
    "id": "order_xxxxxxxxx",
    "status": "completed",
    ...
  }
}
[DEBUG] Response type: order
[DEBUG] Has order: true
[DEBUG] Order ID: order_xxxxxxxxx
[DEBUG] Redirecting to confirmation for order: order_xxxxxxxxx
[OTO] Creating fulfillment for order: order_xxxxxxxxx
[OTO] API response: {...}
```

#### If Something Fails
```
[DEBUG] Placing order for cart: cart_xxxxxxxxx
[DEBUG] Headers: {}
[DEBUG] Cart complete FAILED: Error: Payment not authorized
```

---

## 🐛 Debugging Common Issues

### Issue: Still no order created
If you see `Cart complete FAILED: Error: Payment not authorized`:

1. **Verify webhook received**: Check if you see the Moyasar webhook logs
2. **Check Moyasar dashboard**: Verify the payment was actually successful
3. **Test webhook manually**: Use the Moyasar test webhook to verify it works

### Issue: Confirmation page appears but no order
1. **Check the URL**: Does it show `/order/undefined/confirmed` or `/order/order_xxx/confirmed`?
2. **Check database**: Run this SQL query:
   ```sql
   SELECT id, status, customer_id FROM order_ ORDER BY created_at DESC LIMIT 5;
   ```
3. **Check cart**: The cart might not have been completed. Run:
   ```sql
   SELECT id, user_id, customer_id, completed_at FROM cart ORDER BY created_at DESC LIMIT 5;
   ```

### Issue: Webhook not received
1. **Verify URL**: Ensure `MOYASAR_CALLBACK_URL=http://localhost:8000/checkout` is set
2. **Check network**: Use a tool like ngrok to test webhooks locally
3. **Test with curl**: Manually send a test webhook:
   ```bash
   curl -X POST http://localhost:8000/checkout \
     -H "Content-Type: application/json" \
     -H "x-moyasar-signature: sha256=..." \
     -d '{"id":"test","status":"paid","amount":1000,...}'
   ```

---

## 📋 Verification Checklist

- [ ] Callback URL in `.env` is `http://localhost:8000/checkout`
- [ ] Backend restarted to pick up `.env` changes
- [ ] Webhook route exists at `/checkout` (should be there from medusa/moyasar)
- [ ] Fallback route created at `/sa/checkout` (for backward compatibility)
- [ ] Debug logs added to `placeOrder()` function
- [ ] Test order placed and webhook received
- [ ] Order appears in Medusa admin
- [ ] Order appears in user account
- [ ] OTO fulfillment created (check `[OTO]` logs)

---

## 🎉 Expected Result

After applying these changes:

✅ **Orders will be created in Medusa**
✅ **Orders will appear in admin dashboard**
✅ **Orders will appear in user account**
✅ **OTO fulfillment will be created**
✅ **Full debug logging for troubleshooting**

---

## 📞 Still Having Issues?

If orders are still not being created after these changes:

1. **Check backend logs** for `[DEBUG]` and `[MOYASAR]` messages
2. **Share the logs** with me so I can diagnose further
3. **Verify your database** has orders being created
4. **Test with a different payment provider** (if available) to isolate the issue

The most common remaining issues are:
- Database connection problems
- Payment provider configuration issues
- Network/firewall blocking webhooks
- Missing required fields in checkout

---

**Changes applied on: 2026-07-14**
**Status: Ready for testing**
