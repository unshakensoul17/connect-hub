-- ============================================
-- RESET STORAGE BUCKETS SCRIPT
-- ============================================
-- WARNING: This will delete correctly existing buckets and their contents!

-- 1. Delete policies first to avoid dependency errors
DROP POLICY IF EXISTS "Notes are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Seniors can upload notes files." ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload notes." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own notes files." ON storage.objects;

DROP POLICY IF EXISTS "Avatars are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar." ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar." ON storage.objects;

-- 2. Delete the buckets (cascading to objects)
-- Note: We can't strictly drop buckets if they have objects without emptying them first usually,
-- but removing from storage.buckets usually cascades if configured, or we delete objects first.
DELETE FROM storage.objects WHERE bucket_id IN ('notes-files', 'avatars');
DELETE FROM storage.buckets WHERE id IN ('notes-files', 'avatars');

-- 3. Recreate buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('notes-files', 'notes-files', true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- 4. Re-apply Policies

-- Notes Policies
CREATE POLICY "Notes are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'notes-files');

CREATE POLICY "Authenticated users can upload notes."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'notes-files' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own notes files."
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'notes-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Avatar Policies
CREATE POLICY "Avatars are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar."
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar."
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
