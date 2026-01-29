-- ============================================
-- FINAL DATABASE MIGRATION
-- Campus Connect - Authentication & Profile System Fix
-- ============================================
-- This migration applies the proper RLS policies
-- Run this if setting up a fresh database

-- Step 1: Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies
DROP POLICY IF EXISTS "allow_all_select" ON profiles;
DROP POLICY IF EXISTS "allow_all_insert" ON profiles;
DROP POLICY IF EXISTS "allow_all_update" ON profiles;
DROP POLICY IF EXISTS "allow_all_delete" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile." ON profiles;

-- Step 3: Create proper security-conscious RLS policies
-- Everyone can view profiles (public read)
CREATE POLICY "profiles_select_policy" 
  ON profiles FOR SELECT 
  USING (true);

-- Authenticated users can insert their own profile
CREATE POLICY "profiles_insert_policy"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile  
CREATE POLICY "profiles_update_policy"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "profiles_delete_policy"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Step 4: Grant table-level permissions (REQUIRED for PostgREST)
-- RLS policies alone are not enough - you need GRANT statements too!
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT INSERT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT DELETE ON public.profiles TO authenticated;

-- Step 5: Verify trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    RAISE NOTICE 'WARNING: Trigger on_auth_user_created does not exist!';
    RAISE NOTICE 'Run the full setup_database.sql script to create it.';
  ELSE
    RAISE NOTICE '✓ Trigger on_auth_user_created exists';
  END IF;
END $$;

-- Step 6: Create profiles for any existing users without one
INSERT INTO public.profiles (id, email, full_name, role, points)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  'student',
  0
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 7: Verification
SELECT 
  COUNT(*) FILTER (WHERE p.id IS NOT NULL) as users_with_profiles,
  COUNT(*) FILTER (WHERE p.id IS NULL) as users_without_profiles,
  COUNT(*) as total_users
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;

-- ============================================
-- Migration Complete!
-- ============================================

SELECT '✅ Migration complete! All policies configured.' as status;
