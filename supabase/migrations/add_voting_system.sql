-- Create question_votes table
CREATE TABLE IF NOT EXISTS question_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id, user_id)
);

-- Create answer_votes table
CREATE TABLE IF NOT EXISTS answer_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(answer_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_question_votes_question_id ON question_votes(question_id);
CREATE INDEX IF NOT EXISTS idx_question_votes_user_id ON question_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_answer_votes_answer_id ON answer_votes(answer_id);
CREATE INDEX IF NOT EXISTS idx_answer_votes_user_id ON answer_votes(user_id);

-- Add downvotes column to questions table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='questions' AND column_name='downvotes') THEN
    ALTER TABLE questions ADD COLUMN downvotes INTEGER DEFAULT 0;
  END IF;
END $$;

-- Add downvotes column to answers table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='answers' AND column_name='downvotes') THEN
    ALTER TABLE answers ADD COLUMN downvotes INTEGER DEFAULT 0;
  END IF;
END $$;

-- Function to update question vote counts
CREATE OR REPLACE FUNCTION update_question_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE questions
    SET 
      upvotes = (SELECT COUNT(*) FROM question_votes WHERE question_id = NEW.question_id AND vote_type = 'up'),
      downvotes = (SELECT COUNT(*) FROM question_votes WHERE question_id = NEW.question_id AND vote_type = 'down')
    WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE questions
    SET 
      upvotes = (SELECT COUNT(*) FROM question_votes WHERE question_id = OLD.question_id AND vote_type = 'up'),
      downvotes = (SELECT COUNT(*) FROM question_votes WHERE question_id = OLD.question_id AND vote_type = 'down')
    WHERE id = OLD.question_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update answer vote counts
CREATE OR REPLACE FUNCTION update_answer_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE answers
    SET 
      upvotes = (SELECT COUNT(*) FROM answer_votes WHERE answer_id = NEW.answer_id AND vote_type = 'up'),
      downvotes = (SELECT COUNT(*) FROM answer_votes WHERE answer_id = NEW.answer_id AND vote_type = 'down')
    WHERE id = NEW.answer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE answers
    SET 
      upvotes = (SELECT COUNT(*) FROM answer_votes WHERE answer_id = OLD.answer_id AND vote_type = 'up'),
      downvotes = (SELECT COUNT(*) FROM answer_votes WHERE answer_id = OLD.answer_id AND vote_type = 'down')
    WHERE id = OLD.answer_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for question votes
DROP TRIGGER IF EXISTS trigger_update_question_vote_counts ON question_votes;
CREATE TRIGGER trigger_update_question_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON question_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_question_vote_counts();

-- Create triggers for answer votes
DROP TRIGGER IF EXISTS trigger_update_answer_vote_counts ON answer_votes;
CREATE TRIGGER trigger_update_answer_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON answer_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_answer_vote_counts();

-- Enable Row Level Security
ALTER TABLE question_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for question_votes
CREATE POLICY "Users can view all question votes"
  ON question_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own question votes"
  ON question_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own question votes"
  ON question_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own question votes"
  ON question_votes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for answer_votes
CREATE POLICY "Users can view all answer votes"
  ON answer_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own answer votes"
  ON answer_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answer votes"
  ON answer_votes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own answer votes"
  ON answer_votes FOR DELETE
  USING (auth.uid() = user_id);
