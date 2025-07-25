-- Create addons table
CREATE TABLE public.addons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  addon_type TEXT NOT NULL DEFAULT 'standalone',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;

-- Create policies for addon access
CREATE POLICY "Admins can manage addons" 
ON public.addons 
FOR ALL 
USING (is_admin());

CREATE POLICY "Anyone can view active addons" 
ON public.addons 
FOR SELECT 
USING (is_active = true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_addons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_addons_updated_at
BEFORE UPDATE ON public.addons
FOR EACH ROW
EXECUTE FUNCTION public.update_addons_updated_at();