-- Create function to get users with their purchase statistics
CREATE OR REPLACE FUNCTION public.get_users_with_purchase_stats()
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  role app_role,
  referral_name text,
  avatar_url text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  total_purchases bigint,
  completed_purchases bigint,
  pending_purchases bigint,
  processing_purchases bigint,
  total_spent numeric,
  last_purchase_date timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.referral_name,
    p.avatar_url,
    p.created_at,
    p.updated_at,
    COALESCE(purchase_stats.total_purchases, 0) as total_purchases,
    COALESCE(purchase_stats.completed_purchases, 0) as completed_purchases,
    COALESCE(purchase_stats.pending_purchases, 0) as pending_purchases,
    COALESCE(purchase_stats.processing_purchases, 0) as processing_purchases,
    COALESCE(purchase_stats.total_spent, 0) as total_spent,
    purchase_stats.last_purchase_date
  FROM public.profiles p
  LEFT JOIN (
    SELECT 
      user_id,
      COUNT(*) as total_purchases,
      COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as completed_purchases,
      COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_purchases,
      COUNT(CASE WHEN payment_status = 'processing' THEN 1 END) as processing_purchases,
      SUM(CASE WHEN payment_status = 'completed' THEN total_amount ELSE 0 END) as total_spent,
      MAX(CASE WHEN payment_status = 'completed' THEN created_at END) as last_purchase_date
    FROM public.purchases
    GROUP BY user_id
  ) purchase_stats ON p.id = purchase_stats.user_id
  ORDER BY p.created_at DESC;
$function$;