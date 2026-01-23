## Payment Confirmation Flow Implementation

### 1. Modify PaymentAddress Component (`src/components/payment/PaymentAddress.tsx`)
   - Add `orderId` prop to identify the order
   - Add polling logic (every 8 seconds) to check payment address balance
   - When payment is detected (`sufficient: true`):
     - Call `/api/orders/process-payment` to forward funds to WALLET_PLATFORM
     - Update status to 'confirmed' and display styled success message
     - Show transaction signature with copy functionality
   - Display real-time balance progress during polling

### 2. Update process-payment Route (`src/app/api/orders/process-payment/route.ts`)
   - Store transaction signature in `solana_payment_signature` database field
   - Set `payment_confirmed_at` timestamp
   - Already updates status to 'paid' (correct)

### 3. Update Profile Page (`src/app/profile/page.tsx`)
   - Add status badge for 'paid' orders (green color with checkmark)
   - Orders will automatically appear after payment confirmation

### 4. Update Checkout Page (`src/app/checkout/page.tsx`)
   - Pass `orderId` and `status` props to PaymentAddress
   - Handle status updates when payment is confirmed