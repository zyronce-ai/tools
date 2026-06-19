-- ============================================
-- NAYA SUPABASE PROJECT SETUP
-- Sab SQL yaha se copy karo aur Supabase SQL Editor me paste karo
-- ============================================

-- 1. PROFILES TABLE (agar auth login baad me add karo to)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. STORAGE BUCKET (AI temp files ke liye)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('ai-temp', 'ai-temp', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view ai-temp files"
ON storage.objects FOR SELECT
USING (bucket_id = 'ai-temp');

CREATE POLICY "Public can upload ai-temp files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ai-temp');

CREATE POLICY "Public can update ai-temp files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ai-temp')
WITH CHECK (bucket_id = 'ai-temp');

CREATE POLICY "Public can delete ai-temp files"
ON storage.objects FOR DELETE
USING (bucket_id = 'ai-temp');
