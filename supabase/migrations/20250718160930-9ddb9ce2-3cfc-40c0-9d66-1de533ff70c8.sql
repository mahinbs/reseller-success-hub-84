
-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- Create profiles table to extend auth.users
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role app_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  billing_period TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly, one-time
  features JSONB DEFAULT '[]'::jsonb,
  brochure_url TEXT,
  deck_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bundles table
CREATE TABLE public.bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Junction table for bundle services
CREATE TABLE public.bundle_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  UNIQUE(bundle_id, service_id)
);

-- Create purchases table
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchase items table
CREATE TABLE public.purchase_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  bundle_id UUID REFERENCES public.bundles(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  item_price DECIMAL(10,2) NOT NULL,
  billing_period TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT purchase_item_type_check CHECK (
    (service_id IS NOT NULL AND bundle_id IS NULL) OR 
    (service_id IS NULL AND bundle_id IS NOT NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- RLS Policies for services (public read, admin write)
CREATE POLICY "Anyone can view active services" ON public.services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all services" ON public.services
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert services" ON public.services
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update services" ON public.services
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete services" ON public.services
  FOR DELETE USING (public.is_admin());

-- RLS Policies for bundles (public read, admin write)
CREATE POLICY "Anyone can view active bundles" ON public.bundles
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all bundles" ON public.bundles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can insert bundles" ON public.bundles
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update bundles" ON public.bundles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete bundles" ON public.bundles
  FOR DELETE USING (public.is_admin());

-- RLS Policies for bundle_services
CREATE POLICY "Anyone can view bundle services" ON public.bundle_services
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage bundle services" ON public.bundle_services
  FOR ALL USING (public.is_admin());

-- RLS Policies for purchases
CREATE POLICY "Users can view their own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases" ON public.purchases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" ON public.purchases
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all purchases" ON public.purchases
  FOR UPDATE USING (public.is_admin());

-- RLS Policies for purchase_items
CREATE POLICY "Users can view their purchase items" ON public.purchase_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.purchases 
      WHERE purchases.id = purchase_items.purchase_id 
      AND purchases.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their purchase items" ON public.purchase_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchases 
      WHERE purchases.id = purchase_items.purchase_id 
      AND purchases.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all purchase items" ON public.purchase_items
  FOR SELECT USING (public.is_admin());

-- Create trigger function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert some sample services
INSERT INTO public.services (name, description, category, price, billing_period, features) VALUES
('ChatGPT API Access', 'Access to OpenAI ChatGPT API with dedicated tokens', 'AI Services', 29.99, 'monthly', '["API Access", "24/7 Support", "Usage Analytics"]'),
('Claude API Bundle', 'Anthropic Claude API with enhanced features', 'AI Services', 39.99, 'monthly', '["API Access", "Priority Support", "Custom Integrations"]'),
('Google Workspace', 'Complete Google Workspace suite for businesses', 'Productivity', 12.99, 'monthly', '["Gmail", "Drive", "Docs", "Sheets", "Meet"]'),
('Canva Pro', 'Professional design tools and templates', 'Design', 14.99, 'monthly', '["Premium Templates", "Brand Kit", "Background Remover"]'),
('Notion Pro', 'Advanced productivity and collaboration platform', 'Productivity', 8.99, 'monthly', '["Unlimited Blocks", "Advanced Permissions", "Version History"]');

-- Insert sample bundles
INSERT INTO public.bundles (name, description, discount_percentage, total_price) VALUES
('AI Starter Pack', 'Perfect bundle for AI enthusiasts', 15.00, 59.99),
('Business Essential', 'Everything you need to run your business', 20.00, 89.99),
('Creator Suite', 'Tools for content creators and designers', 25.00, 49.99);

-- Link services to bundles
INSERT INTO public.bundle_services (bundle_id, service_id) VALUES
((SELECT id FROM public.bundles WHERE name = 'AI Starter Pack'), (SELECT id FROM public.services WHERE name = 'ChatGPT API Access')),
((SELECT id FROM public.bundles WHERE name = 'AI Starter Pack'), (SELECT id FROM public.services WHERE name = 'Claude API Bundle')),
((SELECT id FROM public.bundles WHERE name = 'Business Essential'), (SELECT id FROM public.services WHERE name = 'Google Workspace')),
((SELECT id FROM public.bundles WHERE name = 'Business Essential'), (SELECT id FROM public.services WHERE name = 'Notion Pro')),
((SELECT id FROM public.bundles WHERE name = 'Creator Suite'), (SELECT id FROM public.services WHERE name = 'Canva Pro')),
((SELECT id FROM public.bundles WHERE name = 'Creator Suite'), (SELECT id FROM public.services WHERE name = 'Notion Pro'));
