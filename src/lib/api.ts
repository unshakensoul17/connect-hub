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
        },

        // Vote on a question
        async voteQuestion(questionId: string, userId: string, voteType: 'up' | 'down') {
            // Check if user has already voted
            const { data: existingVote } = await supabase
                .from('question_votes')
                .select('*')
                .eq('question_id', questionId)
                .eq('user_id', userId)
                .maybeSingle();

            if (existingVote) {
                // If same vote type, remove the vote (toggle off)
                if (existingVote.vote_type === voteType) {
                    const { error } = await supabase
                        .from('question_votes')
                        .delete()
                        .eq('id', existingVote.id);
                    if (error) throw error;
                    return { action: 'removed', voteType: null };
                } else {
                    // Update to opposite vote type
                    const { error } = await supabase
                        .from('question_votes')
                        .update({ vote_type: voteType, updated_at: new Date().toISOString() })
                        .eq('id', existingVote.id);
                    if (error) throw error;
                    return { action: 'updated', voteType };
                }
            } else {
                // Create new vote
                const { error } = await supabase
                    .from('question_votes')
                    .insert({ question_id: questionId, user_id: userId, vote_type: voteType });
                if (error) throw error;
                return { action: 'created', voteType };
            }
        },

        // Get user's vote on a question
        async getUserQuestionVote(questionId: string, userId: string) {
            const { data, error } = await supabase
                .from('question_votes')
                .select('vote_type')
                .eq('question_id', questionId)
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;
            return data?.vote_type || null;
        },

        // Vote on an answer
        async voteAnswer(answerId: string, userId: string, voteType: 'up' | 'down') {
            // Check if user has already voted
            const { data: existingVote } = await supabase
                .from('answer_votes')
                .select('*')
                .eq('answer_id', answerId)
                .eq('user_id', userId)
                .maybeSingle();

            if (existingVote) {
                // If same vote type, remove the vote (toggle off)
                if (existingVote.vote_type === voteType) {
                    const { error } = await supabase
                        .from('answer_votes')
                        .delete()
                        .eq('id', existingVote.id);
                    if (error) throw error;
                    return { action: 'removed', voteType: null };
                } else {
                    // Update to opposite vote type
                    const { error } = await supabase
                        .from('answer_votes')
                        .update({ vote_type: voteType, updated_at: new Date().toISOString() })
                        .eq('id', existingVote.id);
                    if (error) throw error;
                    return { action: 'updated', voteType };
                }
            } else {
                // Create new vote
                const { error } = await supabase
                    .from('answer_votes')
                    .insert({ answer_id: answerId, user_id: userId, vote_type: voteType });
                if (error) throw error;
                return { action: 'created', voteType };
            }
        },

        // Get user's vote on an answer
        async getUserAnswerVote(answerId: string, userId: string) {
            const { data, error } = await supabase
                .from('answer_votes')
                .select('vote_type')
                .eq('answer_id', answerId)
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;
            return data?.vote_type || null;
        },

        // Mark question as solved and accept an answer
        async markAsSolved(questionId: string, answerId: string, authorId: string) {
            // Verify the user is the question author
            const { data: question } = await supabase
                .from('questions')
                .select('author_id')
                .eq('id', questionId)
                .single();

            if (!question || question.author_id !== authorId) {
                throw new Error('Only the question author can mark it as solved');
            }

            // Update question as solved
            const { error: questionError } = await supabase
                .from('questions')
                .update({ is_solved: true })
                .eq('id', questionId);

            if (questionError) throw questionError;

            // Mark answer as accepted
            const { error: answerError } = await supabase
                .from('answers')
                .update({ is_accepted: true })
                .eq('id', answerId);

            if (answerError) throw answerError;

            // Reward the answer author with bonus points
            const { data: answer } = await supabase
                .from('answers')
                .select('author_id')
                .eq('id', answerId)
                .single();

            if (answer) {
                await (api.profiles as any).incrementPoints(answer.author_id, 15);
            }

            return { success: true };
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
