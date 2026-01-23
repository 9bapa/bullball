-- Create bullrhun_wishlist table
-- Stores user wishlist items with product associations

CREATE TABLE IF NOT EXISTS bullrhun_wishlist (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_wallet_address text NOT NULL,
    product_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY (user_wallet_address) REFERENCES bullrhun_users(wallet_address) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES bullrhun_products(id) ON DELETE CASCADE,
    UNIQUE(user_wallet_address, product_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_wallet ON bullrhun_wishlist(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON bullrhun_wishlist(product_id);

-- Add table comment
COMMENT ON TABLE bullrhun_wishlist IS 'User wishlist items for saving favorite products';