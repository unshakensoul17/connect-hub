import { NextRequest, NextResponse } from 'next/server';
import { retrieveRelevantChunks } from '@/lib/chunk-retrieval';
import { chatWithPDF, Message } from '@/lib/gemini-client';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * Chat with PDF endpoint
 * POST /api/chat/:noteId
 * Body: { message: string, history?: Message[] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await params;
    const { message, history = [] } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log(`💬 Chat request for note: ${noteId}`);
    console.log(`❓ User query: "${message}"`);

    // Check if note exists and is processed
    const { data: note, error: noteError } = await supabaseServer
      .from('notes')
      .select('id, title, pdf_processed, pdf_chunk_count')
      .eq('id', noteId)
      .single();

    if (noteError || !note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    if (!note.pdf_processed || !note.pdf_chunk_count) {
      return NextResponse.json(
        {
          error: 'PDF not processed yet',
          message: 'Please wait while we process this PDF for chat functionality.',
        },
        { status: 400 }
      );
    }

    // Retrieve relevant chunks
    const relevantChunks = await retrieveRelevantChunks(noteId, message, 5);

    if (relevantChunks.length === 0) {
      return NextResponse.json(
        {
          response: 'I could not find relevant information in the PDF to answer your question. Could you rephrase or ask about a different topic covered in the notes?',
          chunksUsed: 0,
        }
      );
    }

    // Extract chunk content
    const chunkContents = relevantChunks.map((c) => c.content);

    console.log(`📚 Using ${chunkContents.length} chunks for context`);

    // Call Gemini API
    const aiResponse = await chatWithPDF(
      chunkContents,
      message,
      history as Message[]
    );

    console.log(`✅ AI response generated`);

    return NextResponse.json({
      response: aiResponse,
      chunksUsed: relevantChunks.length,
      success: true,
    });

  } catch (error) {
    console.error('❌ Chat error:', error);

    // Check if it's a Gemini API error
    if (error instanceof Error && error.message.includes('Gemini API')) {
      return NextResponse.json(
        {
          error: 'AI service temporarily unavailable',
          details: 'Please check if GEMINI_API_KEY is configured.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Get chat status for a note
 * GET /api/chat/:noteId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  try {
    const { noteId } = await params;

    const { data: note, error } = await supabaseServer
      .from('notes')
      .select('pdf_processed, pdf_chunk_count, pdf_text_extracted_at')
      .eq('id', noteId)
      .single();

    if (error || !note) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      available: note.pdf_processed || false,
      chunkCount: note.pdf_chunk_count || 0,
      processedAt: note.pdf_text_extracted_at,
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get chat status' },
      { status: 500 }
    );
  }
}
