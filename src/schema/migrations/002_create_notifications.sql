-- Create bullrhun_notifications table
-- Stores user notifications for orders, products, account updates, and promotions

CREATE TABLE IF NOT EXISTS bullrhun_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_wallet_address text NOT NULL,
    type text NOT NULL CHECK (type IN ('order', 'product', 'account', 'promotion')),
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    action_url text,
    created_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY (user_wallet_address) REFERENCES bullrhun_users(wallet_address) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_wallet ON bullrhun_notifications(user_wallet_address);
CREATE INDEX IF NOT EXISTS idx_notifications_read_status ON bullrhun_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON bullrhun_notifications(type);

-- Add table comment
COMMENT ON TABLE bullrhun_notifications IS 'User notifications for order status, product updates, account alerts, and promotional messages';