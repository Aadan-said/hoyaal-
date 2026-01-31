import { supabase } from '@/api/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export function useChatRooms() {
    return useQuery({
        queryKey: ['chat_rooms'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return [];

            const { data, error } = await supabase
                .from('chat_participants')
                .select('room_id, chat_rooms(*, property:properties(*), messages(content, created_at))')
                .eq('user_id', user.id);

            if (error) throw error;

            // Format data for UI
            return data.map((item: any) => {
                const room = item.chat_rooms;
                const lastMsg = room?.messages?.[0];
                return {
                    id: room?.id,
                    property: room?.property,
                    lastMessage: lastMsg?.content || 'No messages yet',
                    time: lastMsg?.created_at,
                    participants: []
                };
            });

        }
    });
}

export function useChatMessages(roomId: string) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ['messages', roomId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('messages')
                .select('*, sender:profiles(*)')
                .eq('room_id', roomId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data;
        },
        enabled: !!roomId
    });

    // Real-time subscription
    useEffect(() => {
        if (!roomId) return;

        const channel = supabase
            .channel(`room-${roomId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `room_id=eq.${roomId}`
            }, (payload) => {
                queryClient.setQueryData(['messages', roomId], (oldData: any) => {
                    return [...(oldData || []), payload.new];
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomId]);

    return query;
}

export function useCreateMessage() {
    return useMutation({
        mutationFn: async ({ roomId, content }: { roomId: string, content: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Auth required");

            const { error } = await supabase
                .from('messages')
                .insert({
                    room_id: roomId,
                    sender_id: user.id,
                    content
                });

            if (error) throw error;
        }
    });
}
