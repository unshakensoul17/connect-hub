-- ============================================
-- COMPREHENSIVE PERMISSION FIX SCRIPT
-- ============================================

-- 1. Grant Basic Table Permissions
-- RLS policies are useless if the role doesn't have basic CRUD permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON TABLE public.notes TO postgres, service_role;
GRANT ALL ON TABLE public.profiles TO postgres, service_role;

-- Important: Grant authenticated users modify access
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;

-- Also grant to anon if you have any public features (optional but safe for RLS)
GRANT SELECT ON TABLE public.notes TO anon;
GRANT SELECT ON TABLE public.profiles TO anon;

-- 2. Ensure RLS is Enabled
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Notes are viewable by everyone." ON notes;
DROP POLICY IF EXISTS "Seniors can upload notes." ON notes;
DROP POLICY IF EXISTS "Authenticated users can upload notes." ON notes;
DROP POLICY IF EXISTS "Authors can update own notes." ON notes;
DROP POLICY IF EXISTS "Authors can delete own notes." ON notes;

-- 4. Re-apply Correct Policies
CREATE POLICY "Notes are viewable by everyone."
  ON notes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upload notes."
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own notes."
  ON notes FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own notes."
  ON notes FOR DELETE
  USING (auth.uid() = author_id);

-- 5. Fix Profiles Permissions too (just in case)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON profiles;

CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 6. Grant usage on sequences (if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
