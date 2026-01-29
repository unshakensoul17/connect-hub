import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Save a note to user's library
export async function POST(request: NextRequest) {
    try {
        const { noteId, userId } = await request.json();

        console.log('📥 Save request:', { noteId, userId });

        if (!noteId || !userId) {
            return NextResponse.json(
                { error: 'Note ID and User ID are required' },
                { status: 400 }
            );
        }

        console.log('💾 Attempting to insert into saved_notes...');

        const { data, error } = await supabaseServer
            .from('saved_notes')
            .insert({ note_id: noteId, user_id: userId })
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase error:', error);
            // Handle duplicate save (already saved)
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'Note already saved to library' },
                    { status: 409 }
                );
            }
            throw error;
        }

        console.log('✅ Saved successfully:', data);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('❌ Error saving note:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        return NextResponse.json(
            {
                error: 'Failed to save note',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

// Remove a note from user's library
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const noteId = searchParams.get('noteId');
        const userId = searchParams.get('userId');

        if (!noteId || !userId) {
            return NextResponse.json(
                { error: 'Note ID and User ID are required' },
                { status: 400 }
            );
        }

        const { error } = await supabaseServer
            .from('saved_notes')
            .delete()
            .eq('note_id', noteId)
            .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing saved note:', error);
        return NextResponse.json(
            { error: 'Failed to remove note from library' },
            { status: 500 }
        );
    }
}

// Get user's saved notes
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseServer
            .from('saved_notes')
            .select(`
        id,
        created_at,
        note:notes(
          id,
          title,
          description,
          subject,
          file_url,
          downloads,
          rating_avg,
          created_at,
          author:profiles(full_name, role, college_id)
        )
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching saved notes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch saved notes' },
            { status: 500 }
        );
    }
}
