# BullRhun Admin Dashboard Setup

Your Web3 admin dashboard has been successfully implemented! Here's how to get started:

## 🔐 Admin Access

The admin dashboard uses **Web3 wallet authentication** with Solana:

1. Connect your Solana wallet (Phantom, Solflare, etc.)
2. Your wallet address is checked against the `bullrhun_users` table
3. Only users with `role = 'admin'` or `role = 'super_admin'` can access the admin panel

## 🛠️ Setup Instructions

### 1. Database Setup

Run these SQL scripts in order:

```bash
# 1. Create users table for admin authentication
psql -h your-host -U your-user -d your-db -f supabase/users-schema.sql

# 2. Run the user migration
psql -h your-host -U your-user -d your-db -f supabase/users-migration.sql

# 3. Set up Supabase storage for product images
psql -h your-host -U your-user -d your-db -f supabase/storage-setup.sql
```

### 2. Create Admin User

Insert your wallet address as an admin:

```sql
INSERT INTO bullrhun_users (
  email,
  wallet_address,
  role,
  created_at
) VALUES (
  'admin@bullrhun.xyz',
  'YOUR_WALLET_ADDRESS_HERE',
  'admin',
  NOW()
);
```

Replace `YOUR_WALLET_ADDRESS_HERE` with your actual Solana wallet address.

## 🎯 Features Implemented

### Product Management
- ✅ Create, Read, Update, Delete products
- ✅ Image uploads to Supabase storage
- ✅ Product variants (size, color, etc.)
- ✅ Inventory tracking with low stock alerts
- ✅ Product categories and subcategories
- ✅ Pricing management (sale prices, cost tracking)
- ✅ SEO metadata
- ✅ Bulk operations (select multiple products)

### Admin Dashboard
- ✅ Real-time stats overview
- ✅ Recent orders display
- ✅ Low stock alerts
- ✅ Quick action buttons
- ✅ Mobile responsive design
- ✅ Web3 wallet integration

### Security & Authentication
- ✅ Solana wallet connection (Phantom, Solflare)
- ✅ Role-based access control via users table
- ✅ Protected routes with automatic redirect
- ✅ Wallet-based session management

## 📱 Navigation

- **Main Dashboard**: `/admin`
- **Products List**: `/admin/products`
- **Add Product**: `/admin/products/new`
- **Edit Product**: `/admin/products/[id]`
- **Orders**: `/admin/orders` (coming soon)
- **Vendors**: `/admin/vendors` (coming soon)
- **Settings**: `/admin/settings` (coming soon)

## 🎨 UI Components

- Modern, clean admin interface
- Dark/light theme support (via Tailwind)
- Responsive design for mobile/desktop
- Real-time updates and notifications
- Drag-and-drop image uploads
- Bulk selection and actions

## 🔧 Technical Stack

- **Frontend**: Next.js 16 + TypeScript + Tailwind CSS
- **Authentication**: Solana Wallet Adapter (Phantom, Solflare)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage for product images
- **State Management**: React hooks + Context API
- **UI Components**: Shadcn/ui

## 🚀 Getting Started

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Access the admin panel**:
   - Open `http://localhost:3000/admin`
   - Connect your Solana wallet
   - If you're an admin, you'll see the dashboard
   - If not, you'll see an access denied message

3. **Create your first product**:
   - Click "Add Product" in the admin panel
   - Fill in product details
   - Upload product images
   - Set pricing and inventory
   - Save as draft or publish immediately

## 📝 Notes

- All product images are stored in Supabase Storage
- Admin status is checked in real-time from the database
- The admin panel is fully responsive and works on mobile
- Image uploads support JPEG, PNG, and WebP formats (max 5MB)
- Inventory tracking includes automatic low stock alerts

## 🔐 Security Considerations

- Never expose your private keys in the frontend
- Admin verification is done server-side via Supabase RLS
- All sensitive operations require proper authentication
- Storage buckets have appropriate access policies

## 🐛 Troubleshooting

**Can't access admin panel?**
- Check that your wallet address is in the `bullrhun_users` table
- Verify your role is set to 'admin' or 'super_admin'
- Ensure your wallet is properly connected

**Images not uploading?**
- Run the storage-setup.sql script
- Check Supabase storage bucket permissions
- Verify image formats (JPEG, PNG, WebP) and size (<5MB)

**Build errors?**
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript types for wallet integration

Enjoy your new Web3 admin dashboard! 🎉