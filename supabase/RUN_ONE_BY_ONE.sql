-- ============================================
-- ABSOLUTE FINAL FIX - Copy Line by Line
-- ============================================
-- Run EACH command separately, one at a time

-- Command 1: Disable RLS
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Command 2: Verify (should return false)
SELECT rowsecurity FROM pg_tables WHERE tablename = 'profiles';

-- Command 3: Create the specific user's profile
INSERT INTO public.profiles (id, email, full_name, role, points)
VALUES (
  '8b04c6e1-1aae-44d1-9a8d-5355607f2d47',
  'efef@gmail.com',
  'efef',
  'student',
  0
)
ON CONFLICT (id) DO NOTHING;

-- Command 4: Verify profile was created
SELECT * FROM profiles WHERE id = '8b04c6e1-1aae-44d1-9a8d-5355607f2d47';

-- ============================================
-- IMPORTANT: Run each command SEPARATELY!
-- Don't run them all at once!
-- ============================================
