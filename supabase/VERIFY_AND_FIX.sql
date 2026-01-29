-- ============================================
-- VERIFY AND MANUALLY CREATE PROFILE
-- ============================================

-- Step 1: Check if RLS is actually disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';
-- MUST show rls_enabled = false

-- Step 2: Check current policies (should be none if RLS is disabled)
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Step 3: List all users and their profile status
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.id as profile_id,
  p.created_at as profile_created,
  CASE 
    WHEN p.id IS NULL THEN '❌ NO PROFILE - NEEDS FIX' 
    ELSE '✅ HAS PROFILE' 
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Step 4: Create profiles for ANY user without one
-- This uses INSERT with ON CONFLICT to be safe
INSERT INTO public.profiles (id, email, full_name, role, points, created_at)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    split_part(u.email, '@', 1)
  ) as full_name,
  COALESCE(
    u.raw_user_meta_data->>'role',
    'student'
  ) as role,
  0 as points,
  now() as created_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = COALESCE(profiles.full_name, EXCLUDED.full_name);

-- Step 5: Final verification - should show ALL users with profiles
SELECT 
  COUNT(*) as total_users,
  COUNT(p.id) as users_with_profiles,
  COUNT(*) - COUNT(p.id) as users_without_profiles
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;

-- Expected: users_without_profiles = 0

-- Step 6: Test direct access (no RLS should block this)
SELECT * FROM profiles LIMIT 5;

-- ============================================
-- If you STILL get errors after this:
-- 1. Copy the user ID from the browser console
-- 2. Run this manually:
-- 
-- INSERT INTO profiles (id, email, full_name, role, points)
-- VALUES ('USER_ID_HERE', 'email@example.com', 'Name', 'student', 0)
-- ON CONFLICT (id) DO NOTHING;
-- ============================================
