# Database Integration Plan for User Profile

## 🎯 **Overview**
Replace all mock data with real database integration using existing schema tables. Transform the profile page into a fully functional user management system.

## 📋 **Key Requirements**
- ✅ **Profile Editing**: Real CRUD operations on `bullrhun_users` table
- ✅ **Address Management**: Add/edit/remove from `bullrhun_user_addresses` table  
- ✅ **Order History**: Retrieve from `bullrhun_orders` with items from `bullrhun_order_items`
- ✅ **Wishlist**: Create new table + integrate with cart functionality
- ✅ **Order Details**: Full order information with products and reviews
- ✅ **Reviews**: Leave product reviews via `bullrhun_product_reviews` table
- ✅ **Preferences**: Store user settings in `bullrhun_users` (expand schema if needed)
- ✅ **Notifications**: Create new `bullrhun_notifications` table
- ✅ **Loyalty**: Show BullRhun token balance instead of points
- ✅ **Remove**: Security tab, Activity tab, mock data

## 🗃️ **Database Schema Analysis**

### **Existing Tables Available**:
- `bullrhun_users` - User profiles (wallet_address, username, display_name, avatar_url, bio, email, role)
- `bullrhun_orders` - Order history (order_number, total_amount, status, billing/shipping addresses)
- `bullrhun_order_items` - Order details (product_id, quantity, unit_price, status)
- `bullrhun_products` - Product information (name, description, price, image_url)
- `bullrhun_product_reviews` - Product reviews (rating, title, review, is_approved)
- `bullrhun_user_addresses` - User addresses (type, is_default, address details)
- `bullrhun_tokens` - BullRhun tokens (mint, price, market_cap, volume_24h)

### **Tables to Create**:
- `bullrhun_wishlist` - User wishlist items
- `bullrhun_notifications` - User notifications (type, title, message, is_read)
- `bullrhun_user_preferences` - User preferences (theme, language, notifications settings)

## 🔧 **Implementation Plan**

### **Phase 1: API Endpoints Creation**
1. **User Profile APIs**:
   - `GET /api/user/profile` - Get user profile data
   - `PUT /api/user/profile` - Update user profile
   - `PUT /api/user/avatar` - Update avatar

2. **Address Management APIs**:
   - `GET /api/user/addresses` - Get user addresses
   - `POST /api/user/addresses` - Add new address
   - `PUT /api/user/addresses/:id` - Update address
   - `DELETE /api/user/addresses/:id` - Remove address
   - `PUT /api/user/addresses/:id/default` - Set default address

3. **Order Management APIs**:
   - `GET /api/user/orders` - Get order history
   - `GET /api/user/orders/:id` - Get order details
   - `GET /api/user/orders/:id/review` - Check if can leave review

4. **Wishlist APIs**:
   - `GET /api/user/wishlist` - Get wishlist items
   - `POST /api/user/wishlist` - Add to wishlist
   - `DELETE /api/user/wishlist/:id` - Remove from wishlist
   - `POST /api/user/wishlist/:id/cart` - Add wishlist item to cart

5. **Review APIs**:
   - `POST /api/products/:id/reviews` - Leave product review
   - `GET /api/products/:id/reviews` - Get product reviews

6. **Notification APIs**:
   - `GET /api/user/notifications` - Get user notifications
   - `PUT /api/user/notifications/:id/read` - Mark as read
   - `PUT /api/user/notifications/read-all` - Mark all as read

7. **Loyalty APIs**:
   - `GET /api/user/tokens` - Get BullRhun token balance
   - `GET /api/user/rewards` - Get rewards status (coming soon)

### **Phase 2: Database Tables Creation**
1. **Create Wishlist Table**:
   ```sql
   CREATE TABLE bullrhun_wishlist (
       id uuid DEFAULT gen_random_uuid() NOT NULL,
       user_wallet_address text NOT NULL,
       product_id uuid NOT NULL,
       created_at timestamp with time zone DEFAULT now(),
       PRIMARY KEY (id),
       FOREIGN KEY (user_wallet_address) REFERENCES bullrhun_users(wallet_address),
       FOREIGN KEY (product_id) REFERENCES bullrhun_products(id),
       UNIQUE(user_wallet_address, product_id)
   );
   ```

2. **Create Notifications Table**:
   ```sql
   CREATE TABLE bullrhun_notifications (
       id uuid DEFAULT gen_random_uuid() NOT NULL,
       user_wallet_address text NOT NULL,
       type text NOT NULL, -- 'order', 'product', 'account', 'promotion'
       title text NOT NULL,
       message text NOT NULL,
       is_read boolean DEFAULT false,
       action_url text,
       created_at timestamp with time zone DEFAULT now(),
       PRIMARY KEY (id),
       FOREIGN KEY (user_wallet_address) REFERENCES bullrhun_users(wallet_address)
   );
   ```

3. **Create User Preferences Table**:
   ```sql
   CREATE TABLE bullrhun_user_preferences (
       id uuid DEFAULT gen_random_uuid() NOT NULL,
       user_wallet_address text NOT NULL,
       preference_key text NOT NULL,
       preference_value text NOT NULL,
       created_at timestamp with time zone DEFAULT now(),
       updated_at timestamp with time zone DEFAULT now(),
       PRIMARY KEY (id),
       FOREIGN KEY (user_wallet_address) REFERENCES bullrhun_users(wallet_address),
       UNIQUE(user_wallet_address, preference_key)
   );
   ```

### **Phase 3: Frontend Integration**
1. **Profile Tab**:
   - Replace mock profile state with real data from API
   - Enable editing mode with save functionality
   - Add avatar upload capability
   - Remove static mock data

2. **Orders Tab**:
   - Display real order history from database
   - Show order status, dates, totals
   - Filter by status (pending, completed, etc.)
   - Add order details modal/page

3. **Wishlist Tab**:
   - Display real wishlist items
   - Add "Add to Cart" functionality
   - Remove from wishlist capability
   - Show product info and availability

4. **Addresses Tab**:
   - Display saved addresses from database
   - Add new address form
   - Edit existing addresses
   - Set default address functionality
   - Remove address capability

5. **Security Tab - REMOVE**:
   - Delete security tab component
   - Remove from navigation

6. **Activity Tab - REMOVE**:
   - Delete activity tab component
   - Remove from navigation

7. **Loyalty Tab**:
   - Replace points display with BullRhun token balance
   - Show token value and market data
   - Add "Coming Soon" for rewards section
   - Use `bullrhun_tokens` table for token data

8. **Notifications Tab**:
   - Display real notifications from database
   - Mark as read functionality
   - Delete notifications
   - Group by type (order, product, account)

9. **Preferences Tab**:
   - Theme selection (light/dark)
   - Language preference
   - Email notification settings
   - Order status notifications
   - Save preferences to database

### **Phase 4: UI/UX Improvements**
1. **Loading States**: Add skeleton loaders for all data fetching
2. **Error Handling**: Proper error messages and retry options
3. **Success Feedback**: Toast notifications for successful actions
4. **Validation**: Form validation for address and profile editing
5. **Real-time Updates**: WebSocket for notifications if needed
6. **Mobile Optimization**: Ensure all features work on mobile

### **Phase 5: Data Migration**
1. **Remove Mock Data**: Delete all hardcoded data arrays
2. **Update Context**: Modify userContext to use real API calls
3. **State Management**: Replace useState with proper data fetching
4. **Cache Strategy**: Implement React Query or similar for data caching

## 🎯 **Expected Outcome**
- Fully functional user profile with real database integration
- Complete CRUD operations for user data
- Real order history and details
- Working wishlist with cart integration
- Product review system
- Token balance display (BullRhun tokens)
- Notification system
- User preferences management
- Removed unnecessary tabs and mock data
- Professional UI with loading states and error handling

## ⚡ **Technical Notes**
- All APIs will use wallet address for authentication
- Implement proper error handling and validation
- Use existing userContext for authentication state
- Maintain responsive design principles
- Ensure type safety with TypeScript interfaces
- Follow existing code patterns and conventions