-- Add 'old_prices' discount type to coupons table
-- This allows admins to create coupons that revert all services and bundles to their original prices

-- Update the discount_type check constraint to include the new 'old_prices' value
ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_discount_type_check;

-- Recreate the constraint with the new allowed values
ALTER TABLE coupons ADD CONSTRAINT coupons_discount_type_check 
CHECK (discount_type IN ('percentage', 'fixed', 'free_months', '1DollarService', 'old_prices'));

-- Add a comment to explain the new discount type
COMMENT ON COLUMN coupons.discount_type IS 'Type of discount: percentage, fixed, free_months, 1DollarService, or old_prices (reverts to original pricing)';
