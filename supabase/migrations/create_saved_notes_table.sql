-- Create saved_notes table for My Library feature
CREATE TABLE IF NOT EXISTS public.saved_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  note_id uuid REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, note_id) -- Prevent duplicate saves
);

-- Enable RLS
ALTER TABLE public.saved_notes ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved notes
CREATE POLICY "Users can view own saved notes"
  ON public.saved_notes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can save notes
CREATE POLICY "Users can save notes"
  ON public.saved_notes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove saved notes
CREATE POLICY "Users can remove saved notes"
  ON public.saved_notes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS saved_notes_user_id_idx ON public.saved_notes(user_id);
CREATE INDEX IF NOT EXISTS saved_notes_note_id_idx ON public.saved_notes(note_id);

-- Comments
COMMENT ON TABLE public.saved_notes IS 'Stores notes saved to users My Library';
COMMENT ON COLUMN public.saved_notes.user_id IS 'User who saved the note';
COMMENT ON COLUMN public.saved_notes.note_id IS 'Note that was saved';
