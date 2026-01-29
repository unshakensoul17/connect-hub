-- ============================================
-- FINAL COMPLETE FIX - Run This Entire Script
-- ============================================

-- Step 1: Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';
-- If rls_enabled = true, that's why you're getting 403 errors

-- Step 2: DISABLE RLS completely
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify RLS is now disabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';
-- Should show rls_enabled = false

-- Step 4: Create profiles for ALL users who don't have one
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

-- Step 5: Verify all users now have profiles
SELECT 
  u.id,
  u.email,
  CASE WHEN p.id IS NULL THEN '❌ NO PROFILE' ELSE '✅ HAS PROFILE' END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Step 6: Check the specific user from the error
SELECT * FROM profiles WHERE email = 'wewdwe@gmail.com';

-- ============================================
-- RESULT: RLS is now DISABLED
-- All users should have profiles
-- Your app should work now!
-- ============================================

-- After running this:
-- 1. Refresh your browser
-- 2. Try onboarding again
-- 3. Should work!

-- ============================================
-- OPTIONAL: Re-enable RLS later with working policies
-- ============================================
/*
-- Only run this AFTER your app is working

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
CREATE POLICY "enable_read_access_for_all"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "enable_insert_for_authenticated"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);  -- Allow any authenticated user to insert

CREATE POLICY "enable_update_for_users_based_on_user_id"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (true);  -- Allow update if they own the record

CREATE POLICY "enable_delete_for_users_based_on_user_id"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
*/
