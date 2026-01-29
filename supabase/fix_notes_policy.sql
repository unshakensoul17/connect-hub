-- ============================================
-- FIX NOTES POLICIES SCRIPT
-- ============================================

-- 1. Enable RLS (just in case)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Notes are viewable by everyone." ON notes;
DROP POLICY IF EXISTS "Seniors can upload notes." ON notes;
DROP POLICY IF EXISTS "Authenticated users can upload notes." ON notes;
DROP POLICY IF EXISTS "Authors can update own notes." ON notes;
DROP POLICY IF EXISTS "Authors can delete own notes." ON notes;

-- 3. Create correct policies

-- Allow everyone to view notes
CREATE POLICY "Notes are viewable by everyone."
  ON notes FOR SELECT
  USING (true);

-- Allow authenticated users to upload (INSERT) notes if they are the author
CREATE POLICY "Authenticated users can upload notes."
  ON notes FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Allow authors to update their own notes
CREATE POLICY "Authors can update own notes."
  ON notes FOR UPDATE
  USING (auth.uid() = author_id);

-- Allow authors to delete their own notes
CREATE POLICY "Authors can delete own notes."
  ON notes FOR DELETE
  USING (auth.uid() = author_id);
