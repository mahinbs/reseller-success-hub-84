-- Sample Old Prices Coupon Setup
-- Run this after your migration to add a sample old prices coupon

-- Insert a sample old_prices coupon
INSERT INTO public.coupons (
  code, 
  description, 
  discount_type, 
  discount_value, 
  max_uses, 
  valid_until, 
  is_active
) VALUES (
  'OLDPRICES2024', 
  'Special coupon to revert all services to original pre-hike prices - Admin use only', 
  'old_prices', 
  0, -- discount_value is 0 for old_prices type as it's calculated dynamically
  10, -- Limited to 10 uses
  '2025-12-31 23:59:59+00', 
  true
) ON CONFLICT (code) DO NOTHING;

-- Show the created coupon
SELECT 
  code, 
  description, 
  discount_type, 
  discount_value,
  max_uses,
  current_uses,
  valid_until,
  is_active,
  created_at
FROM public.coupons 
WHERE code = 'OLDPRICES2024';
