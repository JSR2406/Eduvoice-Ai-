-- ────────────────────────────────────────────────────────────
-- EduVoice AI Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- ────────────────────────────────────────────────────────────

-- 1. Create Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  school TEXT,
  phone TEXT,
  city TEXT,
  bio TEXT,
  subjects TEXT[] DEFAULT '{}',
  preferred_language TEXT DEFAULT 'English',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, school)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'school'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Create Audio History table
CREATE TABLE public.audio_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  text_content TEXT,
  audio_url TEXT NOT NULL,
  voice_id TEXT NOT NULL,
  voice_name TEXT,
  language TEXT,
  provider TEXT,
  duration_secs INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS
ALTER TABLE public.audio_history ENABLE ROW LEVEL SECURITY;

-- Policies for audio_history
CREATE POLICY "Users can view own history" ON public.audio_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON public.audio_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own history" ON public.audio_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON public.audio_history FOR DELETE USING (auth.uid() = user_id);


-- 3. Create Templates table (Custom templates by teachers)
CREATE TABLE public.templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  emoji TEXT DEFAULT '📋',
  category TEXT DEFAULT 'Custom',
  content TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Policies for templates
CREATE POLICY "Users can view own templates" ON public.templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON public.templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON public.templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON public.templates FOR DELETE USING (auth.uid() = user_id);


-- 4. Create Storage Bucket for Audio Files
INSERT INTO storage.buckets (id, name, public) VALUES ('audio_files', 'audio_files', true);

-- Storage Policies (Requires auth for uploads, public for reads)
CREATE POLICY "Public Read Audio Files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'audio_files');

CREATE POLICY "Authenticated users can upload audio files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'audio_files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own audio files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'audio_files' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own audio files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'audio_files' AND auth.uid() = owner);
