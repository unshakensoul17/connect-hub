import { NextRequest, NextResponse } from 'next/server';
import { getNotesIndex } from '@/lib/meilisearch';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q') || '';
        const subject = searchParams.get('subject');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const index = getNotesIndex();

        // Build filter string
        const filters: string[] = [];
        if (subject) {
            filters.push(`subject = "${subject}"`);
        }
        // Always filter for public notes
        filters.push('is_public = true');

        const filterString = filters.join(' AND ');

        // Search with Meilisearch
        const searchResults = await index.search(query, {
            filter: filterString,
            limit,
            offset,
            attributesToHighlight: ['title', 'description', 'subject'],
            highlightPreTag: '<mark>',
            highlightPostTag: '</mark>',
            sort: query ? undefined : ['created_at:desc'], // Sort by date if no query
        });

        return NextResponse.json({
            success: true,
            results: searchResults.hits,
            total: searchResults.estimatedTotalHits,
            query,
            processingTime: searchResults.processingTimeMs,
        });

    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to search notes',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
