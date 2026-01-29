-- ============================================
-- VERIFICATION & DEBUG SCRIPT
-- ============================================
-- Run this to check if everything is set up correctly

-- Check 1: Does the trigger exist?
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';
-- Expected: 1 row with enabled = 'O' (origin)

-- Check 2: Does the function exist?
SELECT 
  proname as function_name,
  prosecdef as security_definer
FROM pg_proc 
WHERE proname = 'handle_new_user';
-- Expected: 1 row with security_definer = true

-- Check 3: What policies exist on profiles?
SELECT 
  policyname,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'profiles';
-- Expected: 3 policies (SELECT, INSERT, UPDATE)

-- Check 4: Is RLS enabled on profiles?
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';
-- Expected: rls_enabled = true

-- Check 5: How many profiles exist?
SELECT COUNT(*) as profile_count FROM profiles;

-- Check 6: How many auth users exist?
SELECT COUNT(*) as user_count FROM auth.users;

-- Check 7: Which users don't have profiles?
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE WHEN p.id IS NULL THEN 'NO PROFILE' ELSE 'HAS PROFILE' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- ============================================
-- If trigger exists but profiles aren't being created,
-- manually create profiles for existing users:
-- ============================================

-- Uncomment and run this if needed:
/*
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
*/
