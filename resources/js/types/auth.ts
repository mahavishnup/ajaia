export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type Document = {
    id: number;
    user_id: number;
    title: string;
    content: string | null;
    updated_at: string;
    created_at: string;
    owner?: { id: number; name: string };
};

export type ShareEntry = {
    name: string;
    email: string;
};
