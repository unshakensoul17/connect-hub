-- ============================================
-- EMERGENCY FIX - Disable RLS Temporarily
-- ============================================
-- This will allow you to test if RLS is the issue

-- Step 1: DISABLE RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Create the missing profile manually for current user
INSERT INTO public.profiles (id, email, full_name, role, points)
VALUES (
  '6870e6aa-68d7-4e27-8ca9-936b6b95c85b',
  'edfdefef@gmail.com',
  'edfdefef',
  'student',
  0
)
ON CONFLICT (id) DO NOTHING;

-- Step 3: Verify profile was created
SELECT * FROM profiles WHERE id = '6870e6aa-68d7-4e27-8ca9-936b6b95c85b';

-- ============================================
-- NOW TEST YOUR APP - IT SHOULD WORK!
-- ============================================

-- After testing, RE-ENABLE RLS with correct policies:
/*
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- Create policies for anon AND authenticated
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
*/
