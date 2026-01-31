import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useChatRooms } from '@/hooks/useChat';
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

    // Logic to handle "Start Chat" from ListingDetail
    useEffect(() => {
        if (propertyId && ownerId && chatRooms) {
            const existingRoom = chatRooms.find(r => r.property?.id === propertyId);
            if (existingRoom) {
                router.replace({ pathname: '/chat/[id]', params: { id: existingRoom.id } });
            } else {

                // We would need a mutation to create a room
                // For now, let's just show an alert or handle it in a better way
            }
        }
    }, [propertyId, ownerId, chatRooms]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Messages</Text>
            </View>

            {isLoading ? (
                <LoadingSpinner />
            ) : (
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
            )}
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
