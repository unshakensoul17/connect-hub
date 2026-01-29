-- ============================================
-- FIX: Update Profile Permission Issue
-- ============================================
-- This fixes the "permission denied" error when updating profiles

-- Drop existing update policy
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

-- Create a more permissive update policy
CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verify the policy was created
SELECT 
  policyname,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'UPDATE';

-- Test: Try to update your own profile
-- Replace YOUR_USER_ID with your actual user ID
-- UPDATE profiles SET department = 'test' WHERE id = 'YOUR_USER_ID';
