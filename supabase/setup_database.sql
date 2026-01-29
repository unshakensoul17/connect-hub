-- ============================================
-- CAMPUS CONNECT - COMPLETE DATABASE SETUP
-- ============================================
-- This script sets up the entire database from scratch
-- Run this in your Supabase SQL Editor

-- ============================================
-- STEP 1: CREATE TABLES
-- ============================================

-- Create Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  role text DEFAULT 'student',
  college_id text,
  department text,
  semester int,
  points int DEFAULT 0,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Create Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  subject text,
  file_url text NOT NULL,
  author_id uuid REFERENCES public.profiles(id) NOT NULL,
  tags text[],
  downloads int DEFAULT 0,
  rating_avg float DEFAULT 0,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  content text,
  author_id uuid REFERENCES public.profiles(id) NOT NULL,
  tags text[],
  upvotes int DEFAULT 0,
  is_solved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create Answers Table
CREATE TABLE IF NOT EXISTS public.answers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  question_id uuid REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES public.profiles(id) NOT NULL,
  upvotes int DEFAULT 0,
  is_accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- STEP 2: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 3: CREATE RLS POLICIES FOR PROFILES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- Create new policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 4: CREATE RLS POLICIES FOR NOTES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Notes are viewable by everyone." ON notes;
DROP POLICY IF EXISTS "Seniors can upload notes." ON notes;
DROP POLICY IF EXISTS "Authenticated users can upload notes." ON notes;
DROP POLICY IF EXISTS "Authors can update own notes." ON notes;
DROP POLICY IF EXISTS "Authors can delete own notes." ON notes;

-- Create new policies
CREATE POLICY "Notes are viewable by everyone."
  ON notes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload notes."
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own notes."
  ON notes FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own notes."
  ON notes FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- STEP 5: CREATE RLS POLICIES FOR QUESTIONS
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view questions." ON questions;
DROP POLICY IF EXISTS "Authenticated users can ask questions." ON questions;
DROP POLICY IF EXISTS "Authors can update own questions." ON questions;
DROP POLICY IF EXISTS "Authors can delete own questions." ON questions;

-- Create new policies
CREATE POLICY "Everyone can view questions."
  ON questions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can ask questions."
  ON questions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own questions."
  ON questions FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own questions."
  ON questions FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- STEP 6: CREATE RLS POLICIES FOR ANSWERS
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view answers." ON answers;
DROP POLICY IF EXISTS "Authenticated users can answer." ON answers;
DROP POLICY IF EXISTS "Author can update answer" ON answers;
DROP POLICY IF EXISTS "Author can delete answer" ON answers;

-- Create new policies
CREATE POLICY "Everyone can view answers."
  ON answers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can answer."
  ON answers FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Author can update answer"
  ON answers FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Author can delete answer"
  ON answers FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- STEP 7: CREATE AUTOMATIC PROFILE CREATION TRIGGER
-- ============================================

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- STEP 8: CREATE STORAGE BUCKETS
-- ============================================

-- Create notes-files bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes-files', 'notes-files', true)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 9: CREATE STORAGE POLICIES
-- ============================================

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Notes are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Seniors can upload notes files." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload notes." ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar." ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar." ON storage.objects;

-- Notes storage policies
CREATE POLICY "Notes are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'notes-files');

CREATE POLICY "Authenticated users can upload notes."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'notes-files' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own notes files."
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'notes-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatar storage policies
CREATE POLICY "Avatars are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar."
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar."
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================
-- STEP 10: BACKFILL EXISTING USERS
-- ============================================

-- Create profiles for any existing users who don't have one
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'role', 'student')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 11: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);

-- Notes indexes
CREATE INDEX IF NOT EXISTS idx_notes_author_id ON public.notes(author_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject ON public.notes(subject);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON public.notes USING GIN(tags);

-- Questions indexes
CREATE INDEX IF NOT EXISTS idx_questions_author_id ON public.questions(author_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON public.questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_questions_is_solved ON public.questions(is_solved);

-- Answers indexes
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON public.answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_author_id ON public.answers(author_id);
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON public.answers(created_at DESC);

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Verify the setup
DO $$
BEGIN
  RAISE NOTICE '✅ Database setup complete!';
  RAISE NOTICE '📊 Tables created: profiles, notes, questions, answers';
  RAISE NOTICE '🔒 RLS policies enabled and configured';
  RAISE NOTICE '🤖 Auto-profile creation trigger installed';
  RAISE NOTICE '📦 Storage buckets created: notes-files, avatars';
  RAISE NOTICE '🚀 Your Campus Connect database is ready!';
END $$;
