import { supabaseServer } from './supabase-server';

export interface PDFChunk {
    id: string;
    content: string;
    chunk_index: number;
    token_count: number;
    page_number?: number;
}

/**
 * Retrieve relevant chunks for a user query using full-text search
 */
export async function retrieveRelevantChunks(
    noteId: string,
    query: string,
    limit: number = 5
): Promise<PDFChunk[]> {
    try {
        // Use PostgreSQL full-text search
        const { data, error } = await supabaseServer
            .from('pdf_chunks')
            .select('*')
            .eq('note_id', noteId)
            .textSearch('content', query, {
                type: 'websearch',
                config: 'english',
            })
            .order('chunk_index', { ascending: true })
            .limit(limit);

        if (error) {
            console.error('Error retrieving chunks:', error);
            throw error;
        }

        console.log(`🔍 Found ${data?.length || 0} relevant chunks for query: "${query}"`);

        return data as PDFChunk[];
    } catch (error) {
        console.error('Failed to retrieve chunks:', error);
        throw new Error('Failed to search PDF content');
    }
}

/**
 * Get all chunks for a note (for fallback or summary)
 */
export async function getAllChunks(noteId: string): Promise<PDFChunk[]> {
    const { data, error } = await supabaseServer
        .from('pdf_chunks')
        .select('*')
        .eq('note_id', noteId)
        .order('chunk_index', { ascending: true });

    if (error) throw error;
    return data as PDFChunk[];
}

/**
 * Get chunk count for a note
 */
export async function getChunkCount(noteId: string): Promise<number> {
    const { count, error } = await supabaseServer
        .from('pdf_chunks')
        .select('*', { count: 'exact', head: true })
        .eq('note_id', noteId);

    if (error) throw error;
    return count || 0;
}

/**
 * Get context chunks (include neighboring chunks for better context)
 */
export async function getContextChunks(
    noteId: string,
    chunkIndices: number[],
    contextWindow: number = 1
): Promise<PDFChunk[]> {
    // Expand indices to include neighbors
    const expandedIndices = new Set<number>();
    chunkIndices.forEach((index) => {
        for (let i = index - contextWindow; i <= index + contextWindow; i++) {
            if (i >= 0) expandedIndices.add(i);
        }
    });

    const { data, error } = await supabaseServer
        .from('pdf_chunks')
        .select('*')
        .eq('note_id', noteId)
        .in('chunk_index', Array.from(expandedIndices))
        .order('chunk_index', { ascending: true });

    if (error) throw error;
    return data as PDFChunk[];
}
