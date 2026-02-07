import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMarkNotificationRead, useNotifications } from '@/hooks/useNotifications';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { user } = useAuthStore();

    const { data: notifications, isLoading, refetch } = useNotifications(user?.id || '');
    const markAsRead = useMarkNotificationRead();

    const renderItem = ({ item }: { item: any }) => {
        const getIconDetails = () => {
            switch (item.type) {
                case 'message': return { icon: 'chatbubbles', color: '#3B82F6' };
                case 'offer': return { icon: 'document-text', color: '#10B981' };
                case 'offer_update': return { icon: 'notifications', color: '#F59E0B' };
                default: return { icon: 'notifications', color: theme.primary };
            }
        };

        const { icon, color } = getIconDetails();

        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    {
                        backgroundColor: item.is_read ? theme.card : theme.primaryLight + '15',
                        borderBottomColor: theme.border
                    }
                ]}
                onPress={() => {
                    markAsRead.mutate(item.id);
                    if (item.type === 'message') router.push('/(tabs)/(shared)/messages');
                    if (item.type === 'offer' || item.type === 'offer_update') router.push('/(tabs)/(owner)/management');
                }}
            >
                <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                    <Ionicons name={icon as any} size={22} color={color} />
                </View>
                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: theme.text, fontWeight: item.is_read ? '600' : '800' }]}>{item.title}</Text>
                        {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
                    </View>
                    <Text style={[styles.message, { color: theme.textSecondary }]} numberOfLines={2}>
                        {item.message}
                    </Text>
                    <Text style={[styles.time, { color: theme.textSecondary }]}>
                        {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.border} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#F8F9FA' }]} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { backgroundColor: theme.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.background }]}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Ogeysiisyada</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center' }}><LoadingSpinner /></View>
            ) : (
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <View style={[styles.emptyIconContainer, { backgroundColor: theme.card }]}>
                                <Ionicons name="notifications-off-outline" size={80} color={theme.border} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>Ma jiraan ogeysiisyo!</Text>
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                Markaad hesho fariin ama dalab cusub, halkan ayaad ku arki doontaa.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#f1f5f9'
    },
    headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
    list: { paddingBottom: 40 },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        alignItems: 'center'
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    },
    content: { flex: 1, marginRight: 8 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    title: { fontSize: 16 },
    message: { fontSize: 14, lineHeight: 20, marginBottom: 6 },
    time: { fontSize: 11, fontWeight: '600' },
    unreadDot: { width: 8, height: 8, borderRadius: 4 },
    empty: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyIconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    emptyTitle: { fontSize: 22, fontWeight: '800', marginBottom: 12 },
    emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22 }
});
