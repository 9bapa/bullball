# BullRhun E-commerce Merch Section Implementation Plan (Enhanced)

## Overview
Create a comprehensive merch section for BullRhun with horizontal scrolling product showcases, complete e-commerce functionality, vendor management, and Solana payment integration.

## Phase 1: Database Schema Setup

### 1.1 Create Vendors Table
```sql
CREATE TABLE bullrhun_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  contact_person TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT NOT NULL,
  website TEXT,
  payment_terms TEXT DEFAULT 'NET30',
  shipping_lead_time INTEGER DEFAULT 7, -- days
  return_policy TEXT,
  quality_rating NUMERIC(3,2) CHECK (quality_rating >= 0 AND quality_rating <= 5),
  reliability_score NUMERIC(3,2) CHECK (reliability_score >= 0 AND reliability_score <= 5),
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.2 Create Products Table
```sql
CREATE TABLE bullrhun_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES bullrhun_vendors(id),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('sticker', 'hoodie', 'shirt', 'hat', 'accessory')),
  base_price NUMERIC(38,2) NOT NULL CHECK (base_price >= 0),
  cost_price NUMERIC(38,2) CHECK (cost_price >= 0), -- vendor cost
  image_url TEXT,
  gallery_urls TEXT[], -- array of image URLs
  weight_lbs NUMERIC(5,2) CHECK (weight_lbs >= 0), -- for shipping calculations
  dimensions TEXT, -- "L x W x H inches"
  sku TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  tags TEXT[], -- for search and filtering
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.3 Create Product Variants Table
```sql
CREATE TABLE bullrhun_product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES bullrhun_products(id),
  color TEXT,
  size TEXT,
  sku TEXT UNIQUE NOT NULL,
  price_adjustment NUMERIC(38,2) DEFAULT 0 CHECK (price_adjustment >= 0),
  cost_adjustment NUMERIC(38,2) DEFAULT 0 CHECK (cost_adjustment >= 0),
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  reorder_level INTEGER DEFAULT 10 CHECK (reorder_level >= 0),
  weight_adjustment NUMERIC(5,2) DEFAULT 0 CHECK (weight_adjustment >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.4 Create Enhanced Orders Table
```sql
CREATE TABLE bullrhun_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  billing_address TEXT NOT NULL,
  billing_city TEXT NOT NULL,
  billing_state TEXT,
  billing_zip TEXT,
  billing_country TEXT NOT NULL,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  shipping_country TEXT,
  subtotal NUMERIC(38,2) NOT NULL CHECK (subtotal >= 0),
  tax_amount NUMERIC(38,2) DEFAULT 0 CHECK (tax_amount >= 0),
  shipping_cost NUMERIC(38,2) NOT NULL CHECK (shipping_cost >= 0),
  total_amount NUMERIC(38,2) NOT NULL CHECK (total_amount >= 0),
  shipping_method TEXT NOT NULL CHECK (shipping_method IN ('standard', 'rush', 'express')),
  shipping_carrier TEXT, -- UPS, FedEx, USPS, etc.
  tracking_number TEXT,
  tracking_url TEXT,
  estimated_delivery TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_method TEXT NOT NULL DEFAULT 'crypto' CHECK (payment_method IN ('crypto', 'card', 'paypal')),
  solana_payment_address TEXT UNIQUE,
  solana_payment_signature TEXT,
  payment_amount_sol NUMERIC(38,9),
  payment_confirmed_at TIMESTAMPTZ,
  notes TEXT,
  internal_notes TEXT, -- admin-only notes
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.5 Create Order Items Table
```sql
CREATE TABLE bullrhun_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES bullrhun_orders(id),
  product_id UUID REFERENCES bullrhun_products(id),
  variant_id UUID REFERENCES bullrhun_product_variants(id),
  vendor_id UUID REFERENCES bullrhun_vendors(id), -- denormalized for easy queries
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(38,2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(38,2) NOT NULL CHECK (total_price >= 0),
  unit_cost NUMERIC(38,2) CHECK (unit_cost >= 0), -- profit tracking
  total_cost NUMERIC(38,2) CHECK (total_cost >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ordered_from_vendor', 'received', 'shipped_to_customer')),
  vendor_order_id TEXT, -- tracking order with vendor
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.6 Create Shipping Rates Table
```sql
CREATE TABLE bullrhun_shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method TEXT NOT NULL CHECK (method IN ('standard', 'rush', 'express')),
  carrier TEXT, -- UPS, FedEx, USPS
  base_cost NUMERIC(38,2) NOT NULL CHECK (base_cost >= 0),
  cost_per_lb NUMERIC(38,2) DEFAULT 0 CHECK (cost_per_lb >= 0),
  free_shipping_threshold NUMERIC(38,2), -- free shipping over this amount
  description TEXT,
  estimated_days TEXT,
  max_weight_lbs NUMERIC(5,2) CHECK (max_weight_lbs >= 0),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.7 Create Vendor Orders Table (Purchase Orders)
```sql
CREATE TABLE bullrhun_vendor_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES bullrhun_vendors(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'received', 'cancelled')),
  total_cost NUMERIC(38,2) NOT NULL CHECK (total_cost >= 0),
  shipping_cost NUMERIC(38,2) DEFAULT 0 CHECK (shipping_cost >= 0),
  vendor_order_id TEXT, -- vendor's PO number
  vendor_tracking TEXT,
  expected_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.8 Create Vendor Order Items Table
```sql
CREATE TABLE bullrhun_vendor_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_order_id UUID REFERENCES bullrhun_vendor_orders(id),
  product_id UUID REFERENCES bullrhun_products(id),
  variant_id UUID REFERENCES bullrhun_product_variants(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(38,2) NOT NULL CHECK (unit_cost >= 0),
  total_cost NUMERIC(38,2) NOT NULL CHECK (total_cost >= 0),
  quantity_received INTEGER DEFAULT 0 CHECK (quantity_received >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.9 Create Inventory Log Table
```sql
CREATE TABLE bullrhun_inventory_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES bullrhun_product_variants(id),
  change_type TEXT NOT NULL CHECK (change_type IN ('sale', 'purchase', 'adjustment', 'return')),
  quantity_change INTEGER NOT NULL,
  quantity_before INTEGER NOT NULL,
  quantity_after INTEGER NOT NULL,
  reason TEXT,
  reference_id UUID, -- order_id or vendor_order_id
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 1.10 Create Customer Reviews Table
```sql
CREATE TABLE bullrhun_product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES bullrhun_products(id),
  order_id UUID REFERENCES bullrhun_orders(id),
  customer_name TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review TEXT,
  is_verified BOOLEAN DEFAULT FALSE, -- verified purchase
  is_approved BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## Phase 2: Schema Improvements & Considerations

### 2.1 Advanced Features to Consider
1. **Multi-warehouse Support**: Add warehouse locations for inventory management
2. **Tax Calculation**: Region-based tax rates and automatic calculation
3. **Discount System**: Coupon codes, bulk discounts, seasonal promotions
4. **Analytics**: Sales trends, popular products, vendor performance
5. **Customer Accounts**: Order history, saved addresses, wishlists
6. **Return Management**: RMA system, refund processing
7. **Subscription Services**: Monthly boxes, recurring orders

### 2.2 Performance Optimization
1. **Indexing Strategy**: Proper indexes for frequently queried columns
2. **Partitioning**: Consider partitioning large tables by date
3. **Caching**: Redis for product catalog and session data
4. **CDN Integration**: For product images and static assets

### 2.3 Data Integrity
1. **Constraints**: Foreign key relationships and check constraints
2. **Triggers**: Automatic inventory updates and status changes
3. **Stored Procedures**: Complex business logic encapsulation
4. **Audit Trail**: Track all data modifications

### 2.4 Business Logic Considerations
1. **Profit Margins**: Track cost vs selling price for each item
2. **Vendor Performance**: Track delivery times, quality issues
3. **Inventory Forecasting**: Predict reorder points based on sales trends
4. **Customer Lifetime Value**: Track repeat purchases and customer value

## Phase 3: Backend Services (Enhanced)

### 3.1 Vendor Management Service
- `src/services/vendor.service.ts`
- Functions: `createVendor()`, `updateVendor()`, `getVendorPerformance()`, `placeVendorOrder()`

### 3.2 Inventory Service
- `src/services/inventory.service.ts`
- Functions: `updateStock()`, `checkStock()`, `reorderAlerts()`, `inventoryReport()`

### 3.3 Analytics Service
- `src/services/analytics.service.ts`
- Functions: `getSalesReport()`, `getVendorReport()`, `getProfitReport()`

## Phase 4: Frontend Enhancements

### 4.1 Admin Dashboard
- Vendor management interface
- Inventory management
- Order fulfillment workflow
- Analytics and reporting

### 4.2 Enhanced Product Pages
- Customer reviews and ratings
- Related products
- Stock availability indicators
- Size guides and measurements

### 4.3 Customer Account Portal
- Order history and tracking
- Saved addresses and payment methods
- Review management
- Wishlist functionality

## Technical Implementation Details

### Security Enhancements
1. **PCI Compliance**: If handling credit cards directly
2. **GDPR Compliance**: Customer data handling and privacy
3. **Audit Logging**: Track all administrative actions
4. **Access Control**: Role-based permissions for admin features

### API Design
1. **RESTful Design**: Consistent endpoint patterns
2. **Rate Limiting**: Prevent abuse and ensure stability
3. **Versioning**: Support for API evolution
4. **Documentation**: OpenAPI/Swagger specifications

### Integration Points
1. **Shipping APIs**: Real-time rates and tracking
2. **Payment Gateways**: Multiple payment options
3. **Email Service**: Order confirmations and updates
4. **SMS Service**: Shipping notifications

This enhanced schema provides a robust foundation for a professional e-commerce platform with vendor management, comprehensive order tracking, and room for future growth and feature additions.