import { supabase } from "@/lib/supabase";
import { Note, Profile } from "@/types/database";

export const api = {
    notes: {
        async getAll() {
            const { data, error } = await supabase
                .from('notes')
                .select(`
          *,
          author:profiles(full_name, role, college_id)
        `)
                .eq('is_public', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []).map(note => ({
                ...note,
                tags: note.tags || []
            })) as Note[];
        },

        async create(note: Omit<Note, 'id' | 'created_at' | 'downloads' | 'rating_avg' | 'author'>) {
            const { data, error } = await supabase
                .from('notes')
                .insert(note)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async incrementDownloads(id: string) {
            const { data } = await supabase.from('notes').select('downloads').eq('id', id).single();
            if (data) {
                await supabase.from('notes').update({ downloads: (data.downloads || 0) + 1 }).eq('id', id);
            }
        }
    },

    profiles: {
        async get(id: string) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Profile;
        }
    },

    questions: {
        async getAll() {
            const { data, error } = await supabase
                .from('questions')
                .select(`
          *,
          author:profiles(full_name, role, avatar_url),
          answers(count)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data || []).map(q => ({
                ...q,
                tags: q.tags || []
            }));
        },

        async getOne(id: string) {
            const { data, error } = await supabase
                .from('questions')
                .select(`
          *,
          author:profiles(full_name, role, avatar_url),
          answers (
            *,
            author:profiles(full_name, role, avatar_url)
          )
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                (data as any).tags = (data as any).tags || [];
            }
            return data;
        },

        async create(question: { title: string, content: string, tags: string[], author_id: string }) {
            const { data, error } = await supabase
                .from('questions')
                .insert(question)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async createAnswer(answer: { content: string, question_id: string, author_id: string }) {
            const { data, error } = await supabase
                .from('answers')
                .insert(answer)
                .select()
                .single();

            if (error) throw error;

            await (api.profiles as any).incrementPoints(answer.author_id, 5);

            return data;
        }
    },

    reviews: {
        async create(review: { note_id: string, user_id: string, rating: number, comment?: string }) {
            const { data, error } = await supabase
                .from('reviews')
                .insert(review)
                .select()
                .single();

            if (error) throw error;
            return data;
        },

        async getForNote(noteId: string) {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('note_id', noteId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },

        async getUserReviewForNote(noteId: string, userId: string) {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('note_id', noteId)
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;
            return data;
        }
    },

    leaderboard: {
        async getTopUsers(limit = 10) {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('points', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data as Profile[];
        }
    },

    // Helper inside profiles to update points safely
    _helpers: {}
};

// Add increment method to profiles
const extendedProfiles = {
    ...api.profiles,
    async incrementPoints(userId: string, amount: number) {
        const { data } = await supabase.from('profiles').select('points').eq('id', userId).single();
        if (data) {
            await supabase.from('profiles').update({ points: (data.points || 0) + amount }).eq('id', userId);
        }
    }
};

// Override the properly typed object
(api.profiles as any) = extendedProfiles;
