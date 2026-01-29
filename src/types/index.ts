export type Role = 'senior' | 'junior';

export interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    role: Role;
    college_id: string;
    department: string;
    semester: number;
    subjects: string[];
    bio?: string;
    avatar_url?: string;
    points: number;
    badges: Badge[];
    created_at: string;
}

export interface Note {
    id: string;
    title: string;
    subject: string;
    description: string;
    file_url: string;
    file_type: 'pdf' | 'ppt' | 'doc';
    author_id: string;
    author: {
        full_name: string;
        avatar_url?: string;
        role: Role;
    };
    tags: string[];
    downloads: number;
    rating: number; // 0-5
    created_at: string;
    is_public: boolean;
    college_id?: string;
}

export interface Question {
    id: string;
    title: string;
    content: string;
    author_id: string;
    author: {
        full_name: string;
        avatar_url?: string;
    };
    tags: string[];
    upvotes: number;
    answers_count: number;
    is_solved: boolean;
    created_at: string;
}

export interface Badge {
    id: string;
    name: string;
    icon: string; // Lucide icon name or emoji
    color: string;
}
