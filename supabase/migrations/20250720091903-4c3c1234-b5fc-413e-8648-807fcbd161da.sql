
-- Add referral_name column to profiles table
ALTER TABLE public.profiles ADD COLUMN referral_name TEXT;

-- Update the handle_new_user function to include referral_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, referral_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer',
    NEW.raw_user_meta_data->>'referral_name'
  );
  RETURN NEW;
END;
$$;
