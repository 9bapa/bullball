-- Cart table for storing user shopping cart items
CREATE TABLE bullrhun_cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_wallet_address TEXT NOT NULL,
  product_id UUID NOT NULL,
  variant_id TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one user can only have one entry per product/variant combination
  CONSTRAINT unique_user_product_variant UNIQUE (user_wallet_address, product_id, variant_id),
  
  -- Foreign key constraints
  CONSTRAINT cart_user_wallet_fkey 
    FOREIGN KEY (user_wallet_address) REFERENCES bullrhun_users(wallet_address) ON DELETE CASCADE,
  CONSTRAINT cart_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES bullrhun_products(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_cart_user_wallet ON bullrhun_cart(user_wallet_address);
CREATE INDEX idx_cart_product_id ON bullrhun_cart(product_id);
CREATE INDEX idx_cart_user_product ON bullrhun_cart(user_wallet_address, product_id);