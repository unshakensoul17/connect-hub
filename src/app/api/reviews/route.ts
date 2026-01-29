import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// Create a review
export async function POST(request: NextRequest) {
    try {
        const { noteId, userId, rating, comment } = await request.json();

        if (!noteId || !userId || !rating) {
            return NextResponse.json(
                { error: 'Note ID, User ID, and rating are required' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseServer
            .from('reviews')
            .insert({
                note_id: noteId,
                user_id: userId,
                rating,
                comment: comment || null,
            })
            .select(`
        *,
        user:profiles(full_name, role)
      `)
            .single();

        if (error) {
            // Handle duplicate review
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'You have already reviewed this note. Use update instead.' },
                    { status: 409 }
                );
            }
            throw error;
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { error: 'Failed to create review' },
            { status: 500 }
        );
    }
}

// Get reviews for a note
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const noteId = searchParams.get('noteId');

        if (!noteId) {
            return NextResponse.json(
                { error: 'Note ID is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseServer
            .from('reviews')
            .select(`
        *,
        user:profiles(full_name, role, avatar_url)
      `)
            .eq('note_id', noteId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}

// Update a review
export async function PUT(request: NextRequest) {
    try {
        const { reviewId, rating, comment } = await request.json();

        if (!reviewId || !rating) {
            return NextResponse.json(
                { error: 'Review ID and rating are required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseServer
            .from('reviews')
            .update({ rating, comment })
            .eq('id', reviewId)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json(
            { error: 'Failed to update review' },
            { status: 500 }
        );
    }
}
