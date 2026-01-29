import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/types/database';

interface SearchResult {
    id: string;
    title: string;
    description: string;
    subject: string;
    author_id: string;
    author_name: string;
    tags: string[];
    downloads: number;
    rating_avg: number;
    file_url: string;
    created_at: number;
    _formatted?: {
        title: string;
        description: string;
        subject: string;
    };
}

interface UseNotesSearchResult {
    results: SearchResult[];
    loading: boolean;
    error: string | null;
    total: number;
    processingTime: number;
}

export function useNotesSearch(query: string, subject?: string, limit: number = 20): UseNotesSearchResult {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [processingTime, setProcessingTime] = useState(0);

    const searchNotes = useCallback(async () => {
        // Don't search if query is too short (less than 2 chars) unless empty (show all)
        if (query.length === 1) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (query) params.append('q', query);
            if (subject && subject !== 'All') params.append('subject', subject);
            params.append('limit', limit.toString());

            const response = await fetch(`/api/search/notes?${params.toString()}`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Search failed');
            }

            setResults(data.results || []);
            setTotal(data.total || 0);
            setProcessingTime(data.processingTime || 0);
        } catch (err) {
            console.error('Search error:', err);
            setError(err instanceof Error ? err.message : 'Failed to search notes');
            setResults([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [query, subject, limit]);

    useEffect(() => {
        // Debounce search - wait 300ms after user stops typing
        const timeoutId = setTimeout(() => {
            searchNotes();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchNotes]);

    return { results, loading, error, total, processingTime };
}
