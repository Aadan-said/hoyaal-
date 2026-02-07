export type UserRole = 'SEEKER' | 'OWNER' | 'ADMIN';

export interface User {
    id: string;
    phone: string;
    name: string;
    role: UserRole;
    avatar?: string;
    rating?: number;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    register: (user: User) => Promise<void>;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}
