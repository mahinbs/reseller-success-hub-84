-- Default Coupon Codes Setup
-- Run this after your main migration to add some starter coupons

-- 1. FREEMONTH - One month free coupon
INSERT INTO public.coupons (code, description, discount_type, free_months, max_uses, valid_until, is_active)
VALUES (
  'FREEMONTH', 
  'Get one month free on any service - Perfect for new customers!', 
  'free_months', 
  1, 
  100, -- Limit to first 100 users
  '2025-12-31 23:59:59+00', 
  true
) ON CONFLICT (code) DO NOTHING;

-- 2. WELCOME20 - 20% discount for new customers  
INSERT INTO public.coupons (code, description, discount_type, discount_value, max_uses, valid_until, is_active)
VALUES (
  'WELCOME20', 
  'Welcome to BoostMySites! Get 20% off your first order', 
  'percentage', 
  20, 
  200, -- Limit to first 200 users
  '2025-12-31 23:59:59+00', 
  true
) ON CONFLICT (code) DO NOTHING;

-- 3. SAVE500 - Fixed amount discount
INSERT INTO public.coupons (code, description, discount_type, discount_value, max_uses, valid_until, is_active)
VALUES (
  'SAVE500', 
  'Save ₹500 on orders above ₹2000', 
  'fixed', 
  500, 
  50, -- Limited quantity
  '2025-06-30 23:59:59+00', 
  true
) ON CONFLICT (code) DO NOTHING;

-- 4. EARLYBIRD - Early bird special
INSERT INTO public.coupons (code, description, discount_type, discount_value, max_uses, valid_until, is_active)
VALUES (
  'EARLYBIRD', 
  'Early bird special - 15% off for early adopters', 
  'percentage', 
  15, 
  75,
  '2025-03-31 23:59:59+00', 
  true
) ON CONFLICT (code) DO NOTHING;

-- 5. LOYALTY10 - Returning customer discount
INSERT INTO public.coupons (code, description, discount_type, discount_value, valid_until, is_active)
VALUES (
  'LOYALTY10', 
  'Thank you for your loyalty! 10% off any order', 
  'percentage', 
  10, 
  '2025-12-31 23:59:59+00', 
  true
) ON CONFLICT (code) DO NOTHING;

-- Show created coupons
SELECT code, description, discount_type, 
       CASE 
         WHEN discount_type = 'percentage' THEN CONCAT(discount_value::text, '%')
         WHEN discount_type = 'fixed' THEN CONCAT('₹', discount_value::text)
         WHEN discount_type = 'free_months' THEN CONCAT(free_months::text, ' months')
       END as discount,
       max_uses, 
       DATE(valid_until) as expires,
       is_active
FROM public.coupons 
ORDER BY created_at DESC;