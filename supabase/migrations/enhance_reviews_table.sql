-- Update reviews table to ensure it has proper structure
-- This migration ensures reviews table exists with correct schema

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id uuid REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(note_id, user_id) -- One review per user per note
);

-- Enable RLS if not already enabled
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;

-- Everyone can view reviews
CREATE POLICY "Anyone can view reviews"
  ON public.reviews
  FOR SELECT
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Users can create reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON public.reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS reviews_note_id_idx ON public.reviews(note_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews(user_id);

-- Function to update note's average rating
CREATE OR REPLACE FUNCTION public.update_note_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.notes
  SET rating_avg = (
    SELECT COALESCE(AVG(rating), 0)
    FROM public.reviews
    WHERE note_id = COALESCE(NEW.note_id, OLD.note_id)
  )
  WHERE id = COALESCE(NEW.note_id, OLD.note_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update rating_avg when reviews change
DROP TRIGGER IF EXISTS update_note_rating_trigger ON public.reviews;
CREATE TRIGGER update_note_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_note_rating();

-- Comments
COMMENT ON TABLE public.reviews IS 'User reviews and ratings for notes';
COMMENT ON FUNCTION public.update_note_rating() IS 'Automatically updates note rating_avg when reviews change';
