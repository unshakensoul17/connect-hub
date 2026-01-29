import { NextResponse } from 'next/server';
import { initializeMeilisearchIndex, checkMeilisearchHealth } from '@/lib/meilisearch';
import { syncAllNotesToMeilisearch } from '@/lib/meilisearch/sync';

export async function POST() {
    try {
        // Check Meilisearch health
        const isHealthy = await checkMeilisearchHealth();
        if (!isHealthy) {
            return NextResponse.json(
                { success: false, error: 'Meilisearch is not available' },
                { status: 503 }
            );
        }

        // Initialize index configuration
        await initializeMeilisearchIndex();

        // Sync all notes
        const result = await syncAllNotesToMeilisearch();

        return NextResponse.json({
            success: true,
            message: 'Notes synchronized successfully',
            synced: result.synced,
            total: result.total,
            taskUid: result.taskUid,
        });

    } catch (error) {
        console.error('Sync API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to sync notes',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const isHealthy = await checkMeilisearchHealth();

        return NextResponse.json({
            success: true,
            healthy: isHealthy,
            host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700',
        });

    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: 'Health check failed',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
