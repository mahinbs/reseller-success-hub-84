-- Create policy_payments table for tracking fee hike policy payments
CREATE TABLE public.policy_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  email TEXT,
  phone TEXT,
  amount NUMERIC,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending',
  rzp_payment_id TEXT,
  rzp_payment_link_id TEXT,
  rzp_short_url TEXT,
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.policy_payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all policy payments" 
ON public.policy_payments 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Users can view their own policy payments by user_id" 
ON public.policy_payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own policy payments by email" 
ON public.policy_payments 
FOR SELECT 
USING (auth.email() = email);

CREATE POLICY "Webhook can insert policy payments" 
ON public.policy_payments 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_policy_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_policy_payments_updated_at
BEFORE UPDATE ON public.policy_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_policy_payments_updated_at();

-- Enable realtime for policy_payments
ALTER PUBLICATION supabase_realtime ADD TABLE policy_payments;