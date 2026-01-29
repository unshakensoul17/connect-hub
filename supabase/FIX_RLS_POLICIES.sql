-- ============================================
-- FIX RLS POLICIES - Permission Denied Issue
-- ============================================

-- Step 1: Check current policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd;

-- Step 2: Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile." ON profiles;

-- Step 3: Create CORRECT policies with proper permissions

-- Allow everyone to SELECT profiles (public read)
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to INSERT their own profile
CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to UPDATE their own profile
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to DELETE their own profile (optional)
CREATE POLICY "Users can delete own profile."
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Step 4: Verify policies were created
SELECT 
  policyname,
  cmd,
  roles,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd;

-- Step 5: Test if current user can now access profiles
-- Replace USER_ID with: 92c114a4-c20e-4ca3-8fa6-89755f418d2d
-- SELECT * FROM profiles WHERE id = 'USER_ID';

-- ============================================
-- After running this, try the onboarding again!
-- ============================================
