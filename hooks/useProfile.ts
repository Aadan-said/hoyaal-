import { supabase } from '@/api/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useProfile(userId: string) {
    return useQuery({
        queryKey: ['profile', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!userId
    });
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, updates }: { userId: string, updates: any }) => {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (error) throw error;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['profile', variables.userId] });
        }
    });
}
