
-- Add image_url column to services table
ALTER TABLE public.services 
ADD COLUMN image_url TEXT;

-- Add image_url column to bundles table  
ALTER TABLE public.bundles 
ADD COLUMN image_url TEXT;
