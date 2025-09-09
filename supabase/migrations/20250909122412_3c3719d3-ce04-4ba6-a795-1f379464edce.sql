-- Create function to update timestamps for slot_signups
CREATE OR REPLACE FUNCTION public.update_slot_signups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create slot_signups table
CREATE TABLE public.slot_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  payment_proof_url TEXT,
  signature_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on slot_signups
ALTER TABLE public.slot_signups ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert and update their own signups
CREATE POLICY "Anyone can insert slot signups" 
ON public.slot_signups 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update slot signups" 
ON public.slot_signups 
FOR UPDATE 
USING (true);

-- Only admins can view slot signups
CREATE POLICY "Admins can view all slot signups" 
ON public.slot_signups 
FOR SELECT 
USING (is_admin());

-- Create storage bucket for slot submissions
INSERT INTO storage.buckets (id, name, public) VALUES ('slot-submissions', 'slot-submissions', false);

-- Create policies for slot-submissions bucket
CREATE POLICY "Anyone can upload to slot submissions" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'slot-submissions');

CREATE POLICY "Admins can view slot submissions" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'slot-submissions' AND is_admin());

CREATE POLICY "Admins can delete slot submissions" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'slot-submissions' AND is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_slot_signups_updated_at
BEFORE UPDATE ON public.slot_signups
FOR EACH ROW
EXECUTE FUNCTION public.update_slot_signups_updated_at();