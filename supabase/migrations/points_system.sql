-- Points system for Campus Connect
-- Automatic XP rewards based on user actions

-- Function to award points to a user
CREATE OR REPLACE FUNCTION public.award_points(user_id_param uuid, points_param integer)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET points = points + points_param
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Award points when user uploads a note
CREATE OR REPLACE FUNCTION public.award_points_for_note_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Award 10 points for uploading a note
  PERFORM award_points(NEW.author_id, 10);
  RAISE NOTICE 'Awarded 10 points to user % for uploading note', NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Award points when someone downloads a note
CREATE OR REPLACE FUNCTION public.award_points_for_download()
RETURNS TRIGGER AS $$
BEGIN
  -- Award 5 points to the note author when download count increases
  IF NEW.downloads > OLD.downloads THEN
    PERFORM award_points(NEW.author_id, 5);
    RAISE NOTICE 'Awarded 5 points to user % for download', NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Award points when someone rates a note
CREATE OR REPLACE FUNCTION public.award_points_for_rating()
RETURNS TRIGGER AS $$
DECLARE
  note_author_id uuid;
  points_to_award integer;
BEGIN
  -- Get the note author
  SELECT author_id INTO note_author_id
  FROM public.notes
  WHERE id = NEW.note_id;

  -- Award points based on rating
  CASE NEW.rating
    WHEN 5 THEN points_to_award := 10;
    WHEN 4 THEN points_to_award := 5;
    WHEN 3 THEN points_to_award := 3;
    ELSE points_to_award := 0;
  END CASE;

  IF points_to_award > 0 THEN
    PERFORM award_points(note_author_id, points_to_award);
    RAISE NOTICE 'Awarded % points to user % for %star rating', points_to_award, note_author_id, NEW.rating;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Award points for asking questions
CREATE OR REPLACE FUNCTION public.award_points_for_question()
RETURNS TRIGGER AS $$
BEGIN
  -- Award 2 points for asking a question
  PERFORM award_points(NEW.author_id, 2);
  RAISE NOTICE 'Awarded 2 points to user % for asking question', NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Award points for answering questions
CREATE OR REPLACE FUNCTION public.award_points_for_answer()
RETURNS TRIGGER AS $$
BEGIN
  -- Award 5 points for answering a question
  PERFORM award_points(NEW.author_id, 5);
  RAISE NOTICE 'Awarded 5 points to user % for answering', NEW.author_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
-- Trigger for note uploads
DROP TRIGGER IF EXISTS award_points_for_note_upload_trigger ON public.notes;
CREATE TRIGGER award_points_for_note_upload_trigger
  AFTER INSERT ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.award_points_for_note_upload();

-- Trigger for downloads
DROP TRIGGER IF EXISTS award_points_for_download_trigger ON public.notes;
CREATE TRIGGER award_points_for_download_trigger
  AFTER UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.award_points_for_download();

-- Trigger for ratings
DROP TRIGGER IF EXISTS award_points_for_rating_trigger ON public.reviews;
CREATE TRIGGER award_points_for_rating_trigger
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.award_points_for_rating();

-- Trigger for questions (if table exists)
DROP TRIGGER IF EXISTS award_points_for_question_trigger ON public.questions;
CREATE TRIGGER award_points_for_question_trigger
  AFTER INSERT ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION public.award_points_for_question();

-- Trigger for answers (if table exists)
DROP TRIGGER IF EXISTS award_points_for_answer_trigger ON public.answers;
CREATE TRIGGER award_points_for_answer_trigger
  AFTER INSERT ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION public.award_points_for_answer();

-- Comments
COMMENT ON FUNCTION public.award_points IS 'Awards XP points to a user';
COMMENT ON FUNCTION public.award_points_for_note_upload IS 'Awards 10 XP when user uploads a note';
COMMENT ON FUNCTION public.award_points_for_download IS 'Awards 5 XP when someone downloads user note';
COMMENT ON FUNCTION public.award_points_for_rating IS 'Awards XP based on rating (5★=10XP, 4★=5XP, 3★=3XP)';
COMMENT ON FUNCTION public.award_points_for_question IS 'Awards 2 XP when user asks a question';
COMMENT ON FUNCTION public.award_points_for_answer IS 'Awards 5 XP when user answers a question';

-- Backfill points for existing notes
-- Run this once to award points retroactively for existing uploads
DO $$
DECLARE
  note_record RECORD;
BEGIN
  FOR note_record IN 
    SELECT author_id, COUNT(*) as note_count
    FROM public.notes
    GROUP BY author_id
  LOOP
    UPDATE public.profiles
    SET points = points + (note_record.note_count * 10)
    WHERE id = note_record.author_id;
    
    RAISE NOTICE 'Awarded % points to user % for % existing notes', 
      (note_record.note_count * 10), note_record.author_id, note_record.note_count;
  END LOOP;
END $$;
