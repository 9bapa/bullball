# Enhanced Checkout System Implementation Plan

Based on my analysis of the existing codebase, I'll implement a comprehensive checkout enhancement with saved addresses and SOL payment processing.

## Current State Analysis

**Existing Infrastructure:**
- ✅ `bullrhun_user_addresses` table exists with proper schema (id, user_wallet_address, type, is_default, first_name, last_name, company, address_line_1, address_line_2, city, state, zip_code, country, phone, created_at, updated_at)
- ✅ Order creation API (`/api/orders/create`) generates Solana keypairs and encrypts private keys
- ✅ Payment processing API (`/api/orders/process-payment`) handles SOL transfers and fee distribution
- ✅ Encryption service available for private key security

## Implementation Plan

### 1. **Create User Address Management APIs**
- **GET `/api/user-addresses`** - Fetch saved addresses for logged-in user
- **POST `/api/user-addresses`** - Save new shipping address  
- **PUT `/api/user-addresses/[id]`** - Update existing address
- **DELETE `/api/user-addresses/[id]`** - Delete address

### 2. **Enhance Checkout Page UI**
- **Saved Addresses Section:**
  - Load and display saved addresses from `bullrhun_user_addresses`
  - Show dropdown selection if user has >1 saved address
  - Auto-populate form with selected/default address
  - "Use different address" button to show manual form
  
- **Form State Management:**
  - Initialize with saved default address (if exists)
  - Handle address selection from dropdown
  - "Save this address" checkbox for new addresses

### 3. **Payment Address Generation & Display**
- **Update Order Creation:** 
  - Modify `/api/orders/create` to return generated SOL payment address
  - Generate unique Solana keypair for each order
  - Encrypt and store private key in `solana_private_key` field
  
- **Payment UI Enhancement:**
  - Display SOL payment address as text and QR code
  - Copy address functionality
  - Payment status checking
  - Instructions for sending SOL

### 4. **Order Management Flow**
- **Order Creation:** Create order with pending status and payment address
- **Payment Processing:** User sends SOL → call process-payment API
- **Status Updates:** Pending → Paid → Processing/Completed
- **Error Handling:** Insufficient payment, transaction failures

### 5. **Address Save Logic**
- **New Addresses:** Save to `bullrhun_user_addresses` when "Save this address" checked
- **Default Management:** Set `is_default=true` for primary address
- **Validation:** Ensure only shipping addresses saved for checkout

### 6. **UI/UX Enhancements**
- **Loading States:** During order creation and payment processing
- **Error Handling:** Clear error messages for payment issues
- **Success Flow:** Redirect to order confirmation page
- **Mobile Responsive:** QR code and form optimization

## Technical Implementation Details

### **Address Schema Utilization:**
```sql
-- Using existing bullrhun_user_addresses table
- user_wallet_address: Links to logged-in user
- type: 'shipping' or 'billing' 
- is_default: Primary address for auto-population
- Full address fields for complete checkout info
```

### **Security & Encryption:**
- Leverage existing `encryptionService` for SOL private keys
- Generate fresh keypair per order (reduces reuse risk)
- Store encrypted private keys securely in database
- Never expose private keys to frontend

### **Payment Flow Integration:**
1. **Order Creation:** Generate payment address, return to frontend
2. **User Payment:** Display address/QR for SOL transfer
3. **Payment Processing:** Call existing `process-payment` API
4. **Order Completion:** Update status and clear cart

## Files to Create/Modify

1. **New API Routes:**
   - `/src/app/api/user-addresses/route.ts` (GET, POST)
   - `/src/app/api/user-addresses/[id]/route.ts` (PUT, DELETE)

2. **Enhanced Components:**
   - `/src/components/address/AddressSelector.tsx` (new)
   - `/src/components/payment/PaymentAddress.tsx` (new)
   - Update `/src/app/checkout/page.tsx`

3. **API Modifications:**
   - Update `/src/app/api/orders/create/route.ts` to return payment address

4. **Utility Functions:**
   - `/src/lib/address-service.ts` (address management)
   - QR code generation utility

This plan leverages existing infrastructure while adding comprehensive address management and proper SOL payment handling.