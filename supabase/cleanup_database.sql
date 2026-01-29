-- ============================================
-- CAMPUS CONNECT - DATABASE CLEANUP/RESET
-- ============================================
-- ⚠️  WARNING: This script will DELETE ALL DATA!
-- Only run this if you want to completely reset your database
-- This is useful for development/testing

-- ============================================
-- CONFIRMATION CHECK
-- ============================================
-- Before running this script, make sure you understand:
-- 1. ALL user data will be deleted
-- 2. ALL notes, questions, and answers will be deleted
-- 3. ALL uploaded files will remain in storage (delete manually if needed)
-- 4. This action CANNOT be undone

-- ============================================
-- STEP 1: DROP ALL POLICIES
-- ============================================

-- Drop profile policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- Drop notes policies
DROP POLICY IF EXISTS "Notes are viewable by everyone." ON notes;
DROP POLICY IF EXISTS "Seniors can upload notes." ON notes;
DROP POLICY IF EXISTS "Authenticated users can upload notes." ON notes;
DROP POLICY IF EXISTS "Authors can update own notes." ON notes;
DROP POLICY IF EXISTS "Authors can delete own notes." ON notes;

-- Drop questions policies
DROP POLICY IF EXISTS "Everyone can view questions." ON questions;
DROP POLICY IF EXISTS "Authenticated users can ask questions." ON questions;
DROP POLICY IF EXISTS "Authors can update own questions." ON questions;
DROP POLICY IF EXISTS "Authors can delete own questions." ON questions;

-- Drop answers policies
DROP POLICY IF EXISTS "Everyone can view answers." ON answers;
DROP POLICY IF EXISTS "Authenticated users can answer." ON answers;
DROP POLICY IF EXISTS "Author can update answer" ON answers;
DROP POLICY IF EXISTS "Author can delete answer" ON answers;

-- Drop storage policies
DROP POLICY IF EXISTS "Notes are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Seniors can upload notes files." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload notes." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own notes files." ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar." ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar." ON storage.objects;

-- ============================================
-- STEP 2: DROP TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================
-- STEP 3: DROP FUNCTIONS
-- ============================================

DROP FUNCTION IF EXISTS public.handle_new_user();

-- ============================================
-- STEP 4: DROP INDEXES
-- ============================================

-- Profile indexes
DROP INDEX IF EXISTS idx_profiles_email;
DROP INDEX IF EXISTS idx_profiles_role;
DROP INDEX IF EXISTS idx_profiles_department;

-- Notes indexes
DROP INDEX IF EXISTS idx_notes_author_id;
DROP INDEX IF EXISTS idx_notes_subject;
DROP INDEX IF EXISTS idx_notes_created_at;
DROP INDEX IF EXISTS idx_notes_tags;

-- Questions indexes
DROP INDEX IF EXISTS idx_questions_author_id;
DROP INDEX IF EXISTS idx_questions_created_at;
DROP INDEX IF EXISTS idx_questions_tags;
DROP INDEX IF EXISTS idx_questions_is_solved;

-- Answers indexes
DROP INDEX IF EXISTS idx_answers_question_id;
DROP INDEX IF EXISTS idx_answers_author_id;
DROP INDEX IF EXISTS idx_answers_created_at;

-- ============================================
-- STEP 5: DROP TABLES (in correct order due to foreign keys)
-- ============================================

DROP TABLE IF EXISTS public.answers CASCADE;
DROP TABLE IF EXISTS public.questions CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================
-- STEP 6: DELETE STORAGE FILES AND BUCKETS (OPTIONAL)
-- ============================================
-- Uncomment these lines if you want to delete storage buckets and files
-- ⚠️  WARNING: This will permanently delete ALL uploaded files!

-- First, delete all objects from buckets
-- DELETE FROM storage.objects WHERE bucket_id = 'notes-files';
-- DELETE FROM storage.objects WHERE bucket_id = 'avatars';

-- Then, delete the buckets
-- DELETE FROM storage.buckets WHERE id = 'notes-files';
-- DELETE FROM storage.buckets WHERE id = 'avatars';

-- ============================================
-- STEP 7: DELETE AUTH USERS (OPTIONAL - BE VERY CAREFUL!)
-- ============================================
-- ⚠️  EXTREME WARNING: This will delete ALL user accounts!
-- Uncomment ONLY if you want to delete all user accounts
-- This is useful for complete reset during development

-- DELETE FROM auth.users;

-- ============================================
-- CLEANUP COMPLETE!
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database cleanup complete!';
  RAISE NOTICE '🗑️  All tables dropped';
  RAISE NOTICE '🔓 All policies removed';
  RAISE NOTICE '🤖 Triggers and functions removed';
  RAISE NOTICE '📊 Indexes removed';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Note: Auth users and storage files were NOT deleted';
  RAISE NOTICE '💡 To complete reset:';
  RAISE NOTICE '   1. Manually delete files from Storage UI';
  RAISE NOTICE '   2. Uncomment auth.users deletion if needed';
  RAISE NOTICE '   3. Run setup_database.sql to recreate everything';
END $$;
