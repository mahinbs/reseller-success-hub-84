-- Create user_fee_hikes table to manage targeted fee increases for specific users
CREATE TABLE public.user_fee_hikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  percentage NUMERIC NOT NULL DEFAULT 20,
  active BOOLEAN NOT NULL DEFAULT true,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique index to allow upsert operations
CREATE UNIQUE INDEX idx_user_fee_hikes_user_id ON public.user_fee_hikes(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_fee_hikes ENABLE ROW LEVEL SECURITY;

-- Only admins can manage fee hikes
CREATE POLICY "Admins can manage user fee hikes" ON public.user_fee_hikes
FOR ALL
USING (is_admin());

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_fee_hikes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_fee_hikes_updated_at
BEFORE UPDATE ON public.user_fee_hikes
FOR EACH ROW
EXECUTE FUNCTION public.update_user_fee_hikes_updated_at();