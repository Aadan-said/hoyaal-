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

export function useCreateChatRoom() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ propertyId, ownerId }: { propertyId: string, ownerId: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Auth required");

            // 1. Create the room
            const { data: room, error: roomError } = await supabase
                .from('chat_rooms')
                .insert({ property_id: propertyId })
                .select()
                .single();

            if (roomError) throw roomError;

            // 2. Add participants
            const participants = [
                { room_id: room.id, user_id: user.id },
                { room_id: room.id, user_id: ownerId }
            ];

            const { error: partError } = await supabase
                .from('chat_participants')
                .insert(participants);

            if (partError) throw partError;

            return room;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chat_rooms'] });
        }
    });
}

export function useCreateMessage() {
    return useMutation({
        mutationFn: async ({ roomId, content }: { roomId: string, content: string }) => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Auth required");

            // 1. Send the message
            const { error: msgError } = await supabase
                .from('messages')
                .insert({
                    room_id: roomId,
                    sender_id: user.id,
                    content
                });

            if (msgError) throw msgError;

            // 2. Fetch other participants to notify them
            const { data: participants } = await supabase
                .from('chat_participants')
                .select('user_id')
                .eq('room_id', roomId)
                .neq('user_id', user.id);

            // 3. Trigger notifications for others
            if (participants && participants.length > 0) {
                const notifications = participants.map(p => ({
                    user_id: p.user_id,
                    title: 'Fariin Cusub',
                    message: content.length > 50 ? content.substring(0, 50) + '...' : content,
                    type: 'message'
                }));

                await supabase.from('notifications').insert(notifications);
            }
        }
    });
}
