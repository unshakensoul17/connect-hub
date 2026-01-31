export type Role = 'student' | 'senior' | 'junior' | 'admin';

export interface Profile {
    id: string;
    email: string;
    full_name: string;
    role: Role;
    college_id?: string;
    department?: string;
    semester?: number;
    subjects?: string[];
    points: number;
    avatar_url?: string;
    created_at: string;
}

export interface Note {
    id: string;
    title: string;
    description: string;
    subject: string;
    file_url: string;
    author_id: string;
    author?: Profile; // Joined
    tags: string[];
    downloads: number;
    rating_avg: number;
    is_public: boolean;
    created_at: string;
    college_id?: string;
}

export interface Question {
    id: string;
    title: string;
    content: string;
    author_id: string;
    author?: Profile;
    tags: string[];
    upvotes: number;
    downvotes: number;
    is_solved: boolean;
    created_at: string;
    answers?: Answer[]; // Joined count or array
}

export interface Answer {
    id: string;
    content: string;
    question_id: string;
    author_id: string;
    author?: Profile;
    upvotes: number;
    downvotes: number;
    is_accepted: boolean;
    created_at: string;
}

export interface Review {
    id: string;
    note_id: string;
    user_id: string;
    rating: number;
    comment?: string;
    created_at: string;
}

export interface QuestionVote {
    id: string;
    question_id: string;
    user_id: string;
    vote_type: 'up' | 'down';
    created_at: string;
    updated_at: string;
}

export interface AnswerVote {
    id: string;
    answer_id: string;
    user_id: string;
    vote_type: 'up' | 'down';
    created_at: string;
    updated_at: string;
}
