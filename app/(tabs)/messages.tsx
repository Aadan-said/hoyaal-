import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MessagesScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { user } = useAuthStore();

    const mockChats = [
        { id: '1', name: 'Abdi Ahmed', lastMsg: 'Is the villa still available?', time: '10:30 AM', unread: 2 },
        { id: '2', name: 'Ismail Ali', lastMsg: 'I have verified your listing.', time: 'Yesterday', unread: 0 },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Messages</Text>
            </View>

            <FlatList
                data={mockChats}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.chatItem, { borderBottomColor: theme.border }]}>
                        <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
                            <Text style={[styles.avatarText, { color: theme.primary }]}>{item.name.charAt(0)}</Text>
                        </View>
                        <View style={styles.chatInfo}>
                            <View style={styles.chatHeader}>
                                <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                                <Text style={[styles.time, { color: theme.textSecondary }]}>{item.time}</Text>
                            </View>
                            <Text style={[styles.lastMsg, { color: theme.textSecondary }]} numberOfLines={1}>
                                {item.lastMsg}
                            </Text>
                        </View>
                        {item.unread > 0 && (
                            <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                                <Text style={styles.unreadCount}>{item.unread}</Text>
                            </View>
                        )}
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
