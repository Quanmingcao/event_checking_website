-- Add Email and Phone columns to support Public Face Registration
ALTER TABLE public.attendants 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text;

-- Create index for fast lookup by email/phone
CREATE INDEX IF NOT EXISTS idx_attendants_email ON public.attendants(email);
CREATE INDEX IF NOT EXISTS idx_attendants_phone ON public.attendants(phone);
