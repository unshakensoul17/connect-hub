-- ============================================
-- IMMEDIATE FIX - Run This Right Now
-- ============================================

-- Step 1: See which users don't have profiles
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE 
    WHEN p.id IS NULL THEN '❌ MISSING PROFILE' 
    ELSE '✅ HAS PROFILE' 
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Step 2: Create profiles for ALL users missing them
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
);

-- Step 3: Verify - should show 0 users without profiles
SELECT 
  COUNT(*) FILTER (WHERE p.id IS NULL) as missing_profiles,
  COUNT(*) FILTER (WHERE p.id IS NOT NULL) as has_profiles
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id;

-- Step 4: Also fix the UPDATE policy (if not already done)
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- After running this:
-- 1. Refresh your browser
-- 2. You should be redirected to /onboarding automatically
-- 3. Fill the form and submit
-- 4. Should work!
-- ============================================
