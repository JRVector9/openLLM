-- OpenLLM Supabase Schema Setup
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. user_profiles 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  total_quota BIGINT NOT NULL DEFAULT 500000,    -- 5,000 tokens = 500,000 quota units
  used_quota BIGINT NOT NULL DEFAULT 0,
  max_keys INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- ============================================
-- 2. user_api_keys 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  key_name TEXT NOT NULL,
  new_api_token_id INTEGER NOT NULL,
  key_preview TEXT NOT NULL,               -- "sk-abc1..." for display
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  used_quota BIGINT NOT NULL DEFAULT 0,
  remain_quota BIGINT NOT NULL DEFAULT 500000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON public.user_api_keys(user_id);

-- ============================================
-- 3. user_ollama_servers 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_ollama_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  server_name TEXT NOT NULL,
  server_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_health_check TIMESTAMPTZ,
  models TEXT[] DEFAULT '{}',
  new_api_channel_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_ollama_servers_user_id ON public.user_ollama_servers(user_id);

-- ============================================
-- 4. Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_ollama_servers ENABLE ROW LEVEL SECURITY;

-- user_profiles: Users can only read/update their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- user_api_keys: Users can only CRUD their own keys
CREATE POLICY "Users can view own keys"
  ON public.user_api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own keys"
  ON public.user_api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own keys"
  ON public.user_api_keys FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own keys"
  ON public.user_api_keys FOR DELETE
  USING (auth.uid() = user_id);

-- user_ollama_servers: Users can only CRUD their own servers
CREATE POLICY "Users can view own servers"
  ON public.user_ollama_servers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own servers"
  ON public.user_ollama_servers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own servers"
  ON public.user_ollama_servers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own servers"
  ON public.user_ollama_servers FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. Auto-create profile trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. Updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 7. Service role policy for API routes
-- ============================================
-- Allow service role to insert profiles (for the trigger)
CREATE POLICY "Service role can manage profiles"
  ON public.user_profiles FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage keys"
  ON public.user_api_keys FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage servers"
  ON public.user_ollama_servers FOR ALL
  USING (auth.role() = 'service_role');
