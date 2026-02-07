import { supabase } from '@/api/supabase';
import { create } from 'zustand';
import { AuthState, User } from '../types/auth';

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true });
    },

    register: async (userData: User) => {
        // Upsert profile in Supabase
        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: userData.id,
                full_name: userData.name,
                phone: userData.phone,
                role: userData.role,
            }, { onConflict: 'id' });

        if (error) throw error;

        // Update local state
        set({ user: userData, isAuthenticated: true });
    },


    logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, token: null, isAuthenticated: false });
    },

    updateUser: async (updatedUser) => {
        set((state) => {
            if (!state.user) return state;
            const newUser = { ...state.user, ...updatedUser };

            // Sync with DB
            supabase.from('profiles').update({
                full_name: newUser.name,
                role: newUser.role,
                avatar_url: newUser.avatar,
            }).eq('id', state.user.id).then();

            return { user: newUser };
        });
    },
}));

// Initialize store from Supabase session
export const initializeAuth = async () => {
    // 1. Check current session
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
        // Fetch profile data
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (profile) {
            useAuthStore.setState({
                token: session.access_token,
                user: {
                    id: profile.id,
                    name: profile.full_name,
                    phone: profile.phone,
                    role: profile.role,
                    avatar: profile.avatar_url,
                },
                isAuthenticated: true
            });
        }
    }

    // 2. Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profile) {
                useAuthStore.setState({
                    token: session.access_token,
                    user: {
                        id: profile.id,
                        name: profile.full_name,
                        phone: profile.phone,
                        role: profile.role,
                        avatar: profile.avatar_url,
                    },
                    isAuthenticated: true
                });
            }
        } else if (event === 'SIGNED_OUT') {
            useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
        }
    });
};
