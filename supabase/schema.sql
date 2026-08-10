-- InstaFlow IA - Supabase Database Schema SQL Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 8.1 PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    default_timezone TEXT DEFAULT 'America/Sao_Paulo',
    ai_default_tone TEXT DEFAULT 'Envolvente',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.2 INSTAGRAM ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.instagram_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    instagram_business_account_id TEXT NOT NULL,
    facebook_page_id TEXT NOT NULL,
    access_token TEXT NOT NULL, -- Encrypted token
    token_expires_at TIMESTAMPTZ,
    instagram_username TEXT NOT NULL,
    profile_pic_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.3 POSTS TABLE
CREATE TYPE post_media_type AS ENUM ('IMAGE', 'VIDEO', 'CAROUSEL');
CREATE TYPE post_status AS ENUM ('draft', 'scheduled', 'publishing', 'published', 'failed');

CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    instagram_account_id UUID REFERENCES public.instagram_accounts(id) ON DELETE SET NULL,
    caption TEXT,
    media_type post_media_type NOT NULL DEFAULT 'IMAGE',
    media_urls JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of public storage URLs
    scheduled_at TIMESTAMPTZ, -- Nullable if draft
    status post_status NOT NULL DEFAULT 'draft',
    instagram_post_id TEXT,
    instagram_permalink TEXT,
    failure_reason TEXT,
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.4 PUBLICATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.publication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    attempt INT DEFAULT 1,
    action TEXT NOT NULL, -- ex: 'create_media_container', 'publish_media', 'status_check'
    request_payload JSONB,
    response_status INT,
    response_body JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.5 AI USAGE TRACKING TABLE
CREATE TABLE IF NOT EXISTS public.ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    text_generations INT DEFAULT 0,
    image_generations INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- INDEXES FOR FAST QUERYING & CRON PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_posts_cron ON public.posts(status, scheduled_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_posts_user ON public.posts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_user ON public.instagram_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_publication_logs_post ON public.publication_logs(post_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Instagram Accounts Policies
CREATE POLICY "Users can manage own Instagram accounts" ON public.instagram_accounts 
    FOR ALL USING (auth.uid() = user_id);

-- Posts Policies
CREATE POLICY "Users can manage own posts" ON public.posts 
    FOR ALL USING (auth.uid() = user_id);

-- Publication Logs Policies
CREATE POLICY "Users can view own post publication logs" ON public.publication_logs 
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.posts p 
            WHERE p.id = publication_logs.post_id AND p.user_id = auth.uid()
        )
    );

-- AI Usage Policies
CREATE POLICY "Users can view own AI usage" ON public.ai_usage FOR SELECT USING (auth.uid() = user_id);

-- AUTOMATIC TRIGGER FOR NEW USERS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STORAGE BUCKET CONFIGURATION (Run in Supabase Dashboard SQL Editor)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true);
