-- Add commission_rate column to bullrhun_vendors table
ALTER TABLE bullrhun_vendors 
ADD COLUMN commission_rate DECIMAL(5,2) DEFAULT 15.00;

-- Add comment to the column
COMMENT ON COLUMN bullrhun_vendors.commission_rate IS 'Commission rate percentage for vendor (e.g., 15.00 means 15%)';

-- Create index for better query performance if needed
CREATE INDEX idx_vendors_commission_rate ON bullrhun_vendors(commission_rate);