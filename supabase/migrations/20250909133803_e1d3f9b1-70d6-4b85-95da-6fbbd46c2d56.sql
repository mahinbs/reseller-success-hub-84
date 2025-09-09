-- Add government_id_url column to slot_signups table
ALTER TABLE public.slot_signups 
ADD COLUMN government_id_url text;