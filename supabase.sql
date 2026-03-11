-- ========================================================== --
--          PROMPT PILOT - SUPABASE SCHEMA (V2)             --
-- ========================================================== --

-- 1. ENUMS (Organized structure)
DO $$ BEGIN
    CREATE TYPE user_plan AS ENUM ('free', 'pro', 'team');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES
-- Profiles: Extends Supabase Auth users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  plan user_plan DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Logs: Tracks daily usage per user
CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  count INTEGER DEFAULT 0 NOT NULL,
  UNIQUE(user_id, date)
);

-- Prompt History: Stores transformed prompts
CREATE TABLE IF NOT EXISTS public.prompt_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  original_text TEXT NOT NULL,
  transformed_text TEXT NOT NULL,
  mode TEXT DEFAULT 'professional',
  context TEXT,
  model_used TEXT DEFAULT 'gemini-1.5-flash',
  tokens_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FUNCTIONS & TRIGGERS
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup/Reset trigger (Re-apply safely)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 4. ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_history ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES (Bulletproof Access Control)
-- Profiles: Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles 
FOR UPDATE USING (auth.uid() = id);

-- Usage Logs: Users can only see their own usage
CREATE POLICY "Users can view own usage" ON public.usage_logs 
FOR SELECT USING (auth.uid() = user_id);

-- Prompt History: Users can manage their own history
CREATE POLICY "Users can view own history" ON public.prompt_history 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON public.prompt_history 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own history" ON public.prompt_history 
FOR DELETE USING (auth.uid() = user_id);

-- INDEXES for Performance
CREATE INDEX IF NOT EXISTS idx_prompt_history_user ON public.prompt_history(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_date ON public.usage_logs(user_id, date);
