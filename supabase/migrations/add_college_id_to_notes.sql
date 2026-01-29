-- Add college_id to notes
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS college_id text;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notes_college_id ON public.notes(college_id);

-- Backfill existing notes
-- Update each note to have the college_id of its author
UPDATE public.notes n
SET college_id = p.college_id
FROM public.profiles p
WHERE n.author_id = p.id
  AND n.college_id IS NULL;

-- Make it required after backfill (optional, but good for data integrity)
-- ALTER TABLE public.notes ALTER COLUMN college_id SET NOT NULL;

-- Update RLS Policies for Isolation

-- 1. Drop the generic "view everyone" policy
DROP POLICY IF EXISTS "Notes are viewable by everyone." ON notes;

-- 2. Create the scoped policy
CREATE POLICY "Notes are viewable by own college."
  ON notes FOR SELECT
  USING (
    -- Allow visualizing if:
    -- 1. Note is public
    -- 2. AND Note belongs to same college as user
    is_public = true AND
    college_id = (
      SELECT college_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );
  
-- Also ensure newly created notes MUST match the author's college
-- (This is usually handled by the app logic but RLS can enforce it too)
DROP POLICY IF EXISTS "Authenticated users can upload notes." ON notes;

CREATE POLICY "Authenticated users can upload notes."
  ON notes FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    college_id = (
      SELECT college_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  );

-- For testing/admin purposes, you might want a global admin policy,
-- but for strict isolation, this is sufficient.
