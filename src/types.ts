export type User = {
    id: string;
    username: string;
    name: string;
    email: string;
    image?: string;
    bio: string;
    created_at: string;
    updated_at: string;
}

export type Profile = {
    id: string;
    email: string;
    username: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export type Thread = {
    id: string;
    user_id: string;
    title?: string;
    content: string;
    parent_id?: string;
    created_at: string;
    updated_at: string;
    user?: User;
    replies?: Reply[];
    likes_count?: number;
    is_liked?: boolean;
}

export type Reply = {
    id: string;
    user_id: string;
    thread_id: string;
    content: string;
    parent_reply_id?: string;
    created_at: string;
    user?: User;
    likes_count?: number;
    is_liked?: boolean;
}

export type Like = {
    id: string;
    user_id: string;
    thread_id?: string;
    reply_id?: string;
    created_at: string;
}

export type History = {
    id: string;
    user_id: string;
    thread_id: string;
    action: 'viewed' | 'liked' | 'commented' | 'replied';
    created_at: string;
}

// Legacy compatibility
export type Post = Thread;


