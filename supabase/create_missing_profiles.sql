-- ============================================
-- EMERGENCY FIX: Create Profile for Current User
-- ============================================
-- Use this if you're logged in but don't have a profile

-- Step 1: Check which users don't have profiles
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE WHEN p.id IS NULL THEN '❌ NO PROFILE' ELSE '✅ HAS PROFILE' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- Step 2: Create profiles for ALL users who don't have one
-- This is safe to run - it won't duplicate existing profiles
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

-- Step 3: Verify all users now have profiles
SELECT 
  COUNT(*) FILTER (WHERE p.id IS NOT NULL) as users_with_profiles,
  COUNT(*) FILTER (WHERE p.id IS NULL) as users_without_profiles,
  COUNT(*) as total_users
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;

-- Expected result: users_without_profiles = 0
