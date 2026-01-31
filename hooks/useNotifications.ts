import { supabase } from '@/api/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function useNotifications(userId: string) {
    return useQuery({
        queryKey: ['notifications', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!userId
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
}

export function useSendNotification() {
    return useMutation({
        mutationFn: async ({ userId, title, message, type }: { userId: string, title: string, message: string, type?: string }) => {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    title,
                    message,
                    type
                });

            if (error) throw error;
        }
    });
}
