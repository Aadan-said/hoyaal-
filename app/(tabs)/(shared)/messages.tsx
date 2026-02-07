import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChatRooms, useCreateChatRoom, useCreateMessage } from '@/hooks/useChat';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MessagesScreen() {
    const { propertyId, ownerId } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { user } = useAuthStore();
    const { data: chatRooms, isLoading, refetch } = useChatRooms();
    const createRoom = useCreateChatRoom();
    const sendMessage = useCreateMessage();
    const { initialMessage } = useLocalSearchParams();

    // Logic to handle "Start Chat" from ListingDetail or Offer
    useEffect(() => {
        const handleAutoChat = async () => {
            if (propertyId && ownerId && chatRooms && !createRoom.isPending && !createRoom.isSuccess) {
                // Find if there's any room with this property and owner for the current user
                const existingRoom = chatRooms.find(r =>
                    r.property?.id === propertyId &&
                    (r.participants?.some((p: any) => p.user_id === ownerId) || true) // Simplification for now
                );

                if (existingRoom) {
                    router.replace({ pathname: '/chat/[id]', params: { id: existingRoom.id } });
                } else {
                    try {
                        const newRoom = await createRoom.mutateAsync({
                            propertyId: propertyId as string,
                            ownerId: ownerId as string
                        });

                        // Send initial message if provided (e.g. from Offer)
                        if (initialMessage) {
                            await sendMessage.mutateAsync({
                                roomId: newRoom.id,
                                content: initialMessage as string
                            });
                        }

                        router.replace({ pathname: '/chat/[id]', params: { id: newRoom.id } });
                    } catch (error) {
                        console.error("Failed to create chat room", error);
                    }
                }
            }
        };
        handleAutoChat();
    }, [propertyId, ownerId, chatRooms]);

    if (isLoading || createRoom.isPending) {
        return <LoadingSpinner />;
    }
    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Messages</Text>
            </View>

            <FlatList
                data={chatRooms}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.primary} />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.chatItem, { borderBottomColor: theme.border }]}
                        onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}
                    >

                        <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
                            <Text style={[styles.avatarText, { color: theme.primary }]}>
                                {item.property?.title?.charAt(0) || '?'}
                            </Text>
                        </View>
                        <View style={styles.chatInfo}>
                            <View style={styles.chatHeader}>
                                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                                    {item.property?.title || 'General Chat'}
                                </Text>
                                <Text style={[styles.time, { color: theme.textSecondary }]}>
                                    {item.time ? new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </Text>
                            </View>
                            <Text style={[styles.lastMsg, { color: theme.textSecondary }]} numberOfLines={1}>
                                {item.lastMessage}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="chatbubble-ellipses-outline" size={64} color={theme.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No messages yet</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 24, paddingBottom: 16 },
    title: { fontSize: 28, fontWeight: '800' },
    list: { paddingHorizontal: 24 },
    chatItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
    avatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    avatarText: { fontSize: 20, fontWeight: '700' },
    chatInfo: { flex: 1 },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    name: { fontSize: 16, fontWeight: '700' },
    time: { fontSize: 12 },
    lastMsg: { fontSize: 14 },
    unreadBadge: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    unreadCount: { color: '#FFF', fontSize: 10, fontWeight: '700' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600' }
});
