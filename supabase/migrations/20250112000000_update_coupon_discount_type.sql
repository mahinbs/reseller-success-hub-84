-- Update the discount_type check constraint to allow the new 1DollarService value
-- First, drop the existing constraint
ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_discount_type_check;

-- Then recreate it with the new allowed values
ALTER TABLE coupons ADD CONSTRAINT coupons_discount_type_check 
CHECK (discount_type IN ('percentage', 'fixed', 'free_months', '1DollarService'));
