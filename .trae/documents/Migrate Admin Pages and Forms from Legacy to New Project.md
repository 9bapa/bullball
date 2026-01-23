# Admin Migration Plan

Based on my analysis of the legacy admin pages (`/Users/jl1013/Documents/NIT/bull/src/app/admin/`), here's the plan to migrate all functionality to the new admin project:

## Overview
The legacy admin has complete CRUD forms for vendors and products, plus an orders listing. The new admin page is just a dashboard shell with mock data. I'll migrate all the real functionality.

## Tasks

### 1. Create Vendor Management Routes & Forms
**Files to create:**
- `/src/app/admin/vendors/new/page.tsx` - Add new vendor form
- `/src/app/admin/vendors/[id]/edit/page.tsx` - Edit vendor form

**Features to migrate:**
- Complete vendor form with all fields (name, business_name, email, phone, website, address fields, logo upload)
- 13 vendor categories with checkboxes (sticker, hoodie, shirt, hat, accessory, socks, mug, cup, apparel, poster, bag, phone_case, towel, blanket)
- Wallet address auto-fill from connected wallet
- Image upload with preview
- Form validation with error messages
- Success/error modals
- Connect to `vendorService` methods

### 2. Create Product Management Routes & Forms
**Files to create:**
- `/src/app/admin/products/new/page.tsx` - Add new product form
- `/src/app/admin/products/[id]/edit/page.tsx` - Edit product form (optional, can start with new)

**Features to migrate:**
- Complete product form with all fields (name, description, base_price, cost_price, inventory_quantity, vendor_id, image_url, is_active, is_featured, type)
- 13 product types dropdown (same categories as vendors)
- Image upload with Supabase storage integration
- Live product preview card
- Vendor selection dropdown (populated from vendors)
- Form validation
- Success/error modals
- Connect to `productService` methods

### 3. Update Orders Management
**File to update:**
- `/src/app/admin/page.tsx` - Enhance Orders tab with real data

**Features to migrate:**
- Replace mock order cards with real data from `orderService.getAllOrders()`
- Display order details: ID, customer (truncated wallet), total amount, status, date
- Add order status badges (pending, paid, processing, shipped, delivered, cancelled, refunded)
- Add order detail view (click to expand)

### 4. Copy Services from Legacy
**Files to create:**
- `/src/services/vendor.service.ts` - Copy vendor service
- `/src/services/product.service.ts` - Copy product service  
- `/src/services/order.service.ts` - Copy order service

**Services include:**
- Vendor CRUD, search, stats, featured, approve/reject
- Product CRUD, variants, images, stock checking, featured
- Order CRUD, payment confirmation, shipping rates, SOL conversion

### 5. Add Admin Navigation
**Update:**
- `/src/app/admin/page.tsx` - Make "Add Product" and "Add Vendor" buttons functional (link to new routes)
- Add links in Products tab to edit individual products
- Add links in Vendors tab to edit/view vendors

### 6. Add Admin Protection (if not present)
**Component needed:**
- Copy `AdminGate` component from legacy if needed for admin-only access
- Apply to all admin routes

## Dependencies Required
- Copy `vendor.service.ts`, `product.service.ts`, `order.service.ts` to new project
- Ensure `supabase` client is configured in new project
- Check for `encryptionService` (used in order service)
- UI components already exist in new project (Card, Input, Button, Badge, etc.)

## Order of Implementation
1. Copy services first (dependencies for pages)
2. Create vendor add page
3. Create vendor edit page  
4. Create product add page
5. Update orders tab in main dashboard with real data
6. Test all CRUD operations