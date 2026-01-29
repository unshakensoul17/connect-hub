-- Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id uuid REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating int CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(note_id, user_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Reviews are viewable by everyone."
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews."
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews."
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger Function: Update Note Rating Average
CREATE OR REPLACE FUNCTION public.update_note_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.notes
  SET rating_avg = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM public.reviews
    WHERE note_id = COALESCE(NEW.note_id, OLD.note_id)
  )
  WHERE id = COALESCE(NEW.note_id, OLD.note_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_note_rating();

-- Trigger Function: Award Points to Author on Review
CREATE OR REPLACE FUNCTION public.award_author_points_on_review()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run on INSERT (first time review)
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.profiles
    SET points = points + 10
    WHERE id = (SELECT author_id FROM public.notes WHERE id = NEW.note_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_created_award_points
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.award_author_points_on_review();
