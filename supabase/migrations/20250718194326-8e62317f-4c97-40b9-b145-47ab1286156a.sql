
-- Create cart_items table for persistent cart storage
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  service_id UUID REFERENCES public.services(id),
  bundle_id UUID REFERENCES public.bundles(id),
  item_name TEXT NOT NULL,
  item_price NUMERIC NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('service', 'bundle')),
  billing_period TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cart_items
CREATE POLICY "Users can view their own cart items" 
  ON public.cart_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cart items" 
  ON public.cart_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" 
  ON public.cart_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" 
  ON public.cart_items 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Ensure either service_id or bundle_id is set, but not both
ALTER TABLE public.cart_items 
ADD CONSTRAINT cart_items_service_or_bundle_check 
CHECK (
  (service_id IS NOT NULL AND bundle_id IS NULL) OR 
  (service_id IS NULL AND bundle_id IS NOT NULL)
);
