import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { processPDFToChunks } from '@/lib/pdf-processor';

/**
 * Process a PDF and store chunks in database
 * POST /api/pdf/process
 * Body: { noteId: string }
 */
export async function POST(request: NextRequest) {
    try {
        const { noteId } = await request.json();

        if (!noteId) {
            return NextResponse.json(
                { error: 'Note ID is required' },
                { status: 400 }
            );
        }

        console.log(`📄 Starting PDF processing for note: ${noteId}`);

        // Fetch note details
        const { data: note, error: noteError } = await supabaseServer
            .from('notes')
            .select('file_url, title, pdf_processed')
            .eq('id', noteId)
            .single();

        if (noteError || !note) {
            return NextResponse.json(
                { error: 'Note not found' },
                { status: 404 }
            );
        }

        // Check if already processed
        if (note.pdf_processed) {
            console.log(`ℹ️ PDF already processed for note: ${noteId}`);
            return NextResponse.json({
                success: true,
                message: 'PDF already processed',
                alreadyProcessed: true,
            });
        }

        // Download PDF from Supabase Storage
        const pdfUrl = note.file_url;
        console.log(`⬇️ Downloading PDF from: ${pdfUrl}`);

        const pdfResponse = await fetch(pdfUrl);
        if (!pdfResponse.ok) {
            throw new Error('Failed to download PDF');
        }

        const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
        console.log(`✅ PDF downloaded: ${pdfBuffer.length} bytes`);

        // Process PDF into chunks
        const chunks = await processPDFToChunks(pdfBuffer);

        if (chunks.length === 0) {
            return NextResponse.json(
                { error: 'No text content found in PDF' },
                { status: 400 }
            );
        }

        // Delete existing chunks (if any)
        await supabaseServer
            .from('pdf_chunks')
            .delete()
            .eq('note_id', noteId);

        // Insert chunks into database
        const chunksToInsert = chunks.map((chunk) => ({
            note_id: noteId,
            chunk_index: chunk.chunkIndex,
            content: chunk.content,
            token_count: chunk.tokenCount,
            page_number: chunk.pageNumber,
        }));

        const { error: insertError } = await supabaseServer
            .from('pdf_chunks')
            .insert(chunksToInsert);

        if (insertError) {
            console.error('❌ Error inserting chunks:', insertError);
            throw insertError;
        }

        // Update note to mark as processed
        const { error: updateError } = await supabaseServer
            .from('notes')
            .update({
                pdf_processed: true,
                pdf_text_extracted_at: new Date().toISOString(),
                pdf_chunk_count: chunks.length,
            })
            .eq('id', noteId);

        if (updateError) {
            console.error('❌ Error updating note:', updateError);
        }

        console.log(`✅ Successfully processed PDF: ${chunks.length} chunks stored`);

        return NextResponse.json({
            success: true,
            message: 'PDF processed successfully',
            chunkCount: chunks.length,
            totalTokens: chunks.reduce((sum, c) => sum + c.tokenCount, 0),
        });

    } catch (error) {
        console.error('❌ PDF processing error:', error);
        return NextResponse.json(
            {
                error: 'Failed to process PDF',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
