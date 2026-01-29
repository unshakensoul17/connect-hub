import { getNotesIndex } from '../meilisearch';
import { supabaseServer } from '../supabase-server';
import { Note } from '@/types/database';


/**
 * Format note for Meilisearch indexing
 */
function formatNoteForMeilisearch(note: Note) {
    return {
        id: note.id,
        title: note.title,
        description: note.description || '',
        subject: note.subject,
        author_id: note.author_id,
        author_name: note.author?.full_name || 'Anonymous',
        tags: note.tags || [],
        downloads: note.downloads,
        rating_avg: note.rating_avg,
        is_public: note.is_public,
        file_url: note.file_url,
        created_at: new Date(note.created_at).getTime(), // Convert to timestamp for sorting
    };
}

/**
 * Sync a single note to Meilisearch
 */
export async function syncNoteToMeilisearch(note: Note) {
    try {
        const index = getNotesIndex();
        const formattedNote = formatNoteForMeilisearch(note);

        await index.addDocuments([formattedNote], { primaryKey: 'id' });
        console.log(`✅ Synced note to Meilisearch: ${note.title}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to sync note to Meilisearch:', error);
        throw error;
    }
}

/**
 * Sync all notes from Supabase to Meilisearch
 */
export async function syncAllNotesToMeilisearch() {
    try {
        const index = getNotesIndex();

        // Fetch all public notes from Supabase
        // Using left join to handle missing profiles
        const { data: notes, error } = await supabaseServer
            .from('notes')
            .select(`
        *,
        author:profiles!left(full_name, role, college_id)
      `)
            .eq('is_public', true);

        if (error) {
            console.error('❌ Error fetching notes:', error);
            throw error;
        }

        console.log('📊 Query result:', {
            notesCount: notes?.length || 0,
            notes: notes
        });

        if (!notes || notes.length === 0) {
            console.log('⚠️  No notes found to sync');
            return { synced: 0, total: 0 };
        }

        // Format notes for Meilisearch
        const formattedNotes = notes.map(note => formatNoteForMeilisearch(note as Note));

        console.log('📝 Formatted notes:', formattedNotes.length);

        // Add all documents to Meilisearch
        const task = await index.addDocuments(formattedNotes, { primaryKey: 'id' });

        console.log(`✅ Synced ${formattedNotes.length} notes to Meilisearch`);
        console.log(`📊 Task UID: ${task.taskUid}`);

        return {
            synced: formattedNotes.length,
            total: notes.length,
            taskUid: task.taskUid
        };
    } catch (error) {
        console.error('❌ Failed to sync all notes:', error);
        throw error;
    }
}

/**
 * Update a note in Meilisearch
 */
export async function updateNoteInMeilisearch(note: Note) {
    try {
        const index = getNotesIndex();
        const formattedNote = formatNoteForMeilisearch(note);

        await index.updateDocuments([formattedNote]);
        console.log(`✅ Updated note in Meilisearch: ${note.title}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to update note in Meilisearch:', error);
        throw error;
    }
}

/**
 * Remove a note from Meilisearch
 */
export async function removeNoteFromMeilisearch(noteId: string) {
    try {
        const index = getNotesIndex();
        await index.deleteDocument(noteId);
        console.log(`✅ Removed note from Meilisearch: ${noteId}`);
        return true;
    } catch (error) {
        console.error('❌ Failed to remove note from Meilisearch:', error);
        throw error;
    }
}

/**
 * Clear all notes from Meilisearch index
 */
export async function clearNotesIndex() {
    try {
        const index = getNotesIndex();
        await index.deleteAllDocuments();
        console.log('✅ Cleared all documents from Meilisearch');
        return true;
    } catch (error) {
        console.error('❌ Failed to clear Meilisearch index:', error);
        throw error;
    }
}

/**
 * Get index statistics
 */
export async function getIndexStats() {
    try {
        const index = getNotesIndex();
        const stats = await index.getStats();
        return stats;
    } catch (error) {
        console.error('❌ Failed to get index stats:', error);
        throw error;
    }
}
