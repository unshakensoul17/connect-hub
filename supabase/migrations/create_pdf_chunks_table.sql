-- Create table for storing PDF text chunks
CREATE TABLE IF NOT EXISTS public.pdf_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id uuid REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  page_number integer,
  token_count integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(note_id, chunk_index)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS pdf_chunks_note_id_idx ON public.pdf_chunks(note_id);
CREATE INDEX IF NOT EXISTS pdf_chunks_content_search_idx ON public.pdf_chunks USING gin(to_tsvector('english', content));

-- Add columns to notes table for tracking PDF processing
ALTER TABLE public.notes 
ADD COLUMN IF NOT EXISTS pdf_processed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pdf_text_extracted_at timestamptz,
ADD COLUMN IF NOT EXISTS pdf_chunk_count integer DEFAULT 0;

-- Enable RLS on pdf_chunks
ALTER TABLE public.pdf_chunks ENABLE ROW LEVEL SECURITY;

-- Allow users to view chunks for notes they have access to
CREATE POLICY "Users can view chunks for accessible notes"
  ON public.pdf_chunks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.notes
      WHERE notes.id = pdf_chunks.note_id
      AND notes.is_public = true
    )
  );

-- Grant permissions
GRANT ALL ON public.pdf_chunks TO authenticated;
GRANT ALL ON public.pdf_chunks TO anon;

-- Comments
COMMENT ON TABLE public.pdf_chunks IS 'Stores chunked text from PDFs for chat functionality';
COMMENT ON COLUMN public.pdf_chunks.chunk_index IS 'Sequential order of chunk in document';
COMMENT ON COLUMN public.pdf_chunks.content IS 'Text content of this chunk';
COMMENT ON COLUMN public.pdf_chunks.token_count IS 'Estimated token count for API cost tracking';
