-- Add business information fields to purchases table
ALTER TABLE purchases 
ADD COLUMN customer_business_name TEXT,
ADD COLUMN customer_address TEXT;

-- Update the purchases table comment
COMMENT ON COLUMN purchases.customer_business_name IS 'Business name if this is a business purchase';
COMMENT ON COLUMN purchases.customer_address IS 'Customer billing address';