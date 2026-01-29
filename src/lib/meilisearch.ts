import { MeiliSearch } from 'meilisearch';

// Meilisearch client configuration
const MEILISEARCH_HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_MASTER_KEY || 'campus_connect_master_key_2026';

const meilisearchClient = new MeiliSearch({
    host: MEILISEARCH_HOST,
    apiKey: MEILISEARCH_API_KEY,
});

// Index name for notes
export const NOTES_INDEX = 'notes';

/**
 * Initialize Meilisearch index with proper configuration
 */
export async function initializeMeilisearchIndex() {
    try {
        const index = meilisearchClient.index(NOTES_INDEX);

        // Configure searchable attributes (fields to search in)
        await index.updateSearchableAttributes([
            'title',
            'description',
            'subject',
            'author_name',
            'tags',
        ]);

        // Configure filterable attributes (fields to filter by)
        await index.updateFilterableAttributes([
            'subject',
            'tags',
            'author_id',
            'is_public',
            'created_at',
        ]);

        // Configure sortable attributes
        await index.updateSortableAttributes([
            'created_at',
            'downloads',
            'rating_avg',
        ]);

        // Configure ranking rules (order of importance)
        await index.updateRankingRules([
            'words',
            'typo',
            'proximity',
            'attribute',
            'sort',
            'exactness',
        ]);

        // Configure typo tolerance
        await index.updateTypoTolerance({
            enabled: true,
            minWordSizeForTypos: {
                oneTypo: 4,
                twoTypos: 8,
            },
        });

        // Configure pagination
        await index.updatePagination({
            maxTotalHits: 1000,
        });

        console.log('✅ Meilisearch index initialized successfully');
        return index;
    } catch (error) {
        console.error('❌ Failed to initialize Meilisearch index:', error);
        throw error;
    }
}

/**
 * Get Meilisearch client instance
 */
export function getMeilisearchClient() {
    return meilisearchClient;
}

/**
 * Get notes index
 */
export function getNotesIndex() {
    return meilisearchClient.index(NOTES_INDEX);
}

/**
 * Check Meilisearch health
 */
export async function checkMeilisearchHealth() {
    try {
        const health = await meilisearchClient.health();
        return health.status === 'available';
    } catch (error) {
        console.error('Meilisearch health check failed:', error);
        return false;
    }
}

export default meilisearchClient;
