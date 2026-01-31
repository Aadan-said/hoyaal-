import { useI18n } from '@/api/i18n';
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
    const { mutate: markAsRead } = useMarkNotificationRead();
    const { t } = useI18n();

    const handleNotificationPress = (notification: any) => {
        if (!notification.is_read) {
            markAsRead(notification.id);
        }
        // Logic for navigation based on type can go here
        if (notification.type === 'message') {
            router.push({ pathname: '/(tabs)/messages' });
        }

    };

    const NotificationItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.item, { backgroundColor: item.is_read ? theme.background : theme.primaryLight + '20' }]}
            onPress={() => handleNotificationPress(item)}
        >
            <View style={[styles.iconBox, { backgroundColor: item.is_read ? theme.inputBackground : theme.primaryLight }]}>
                <Ionicons
                    name={item.type === 'message' ? "chatbubble" : item.type === 'verification' ? "shield-checkmark" : "notifications"}
                    size={20}
                    color={item.is_read ? theme.textSecondary : theme.primary}
                />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text, fontWeight: item.is_read ? '500' : '700' }]}>{item.title}</Text>
                <Text style={[styles.message, { color: theme.textSecondary }]}>{item.message}</Text>
                <Text style={[styles.time, { color: theme.textSecondary }]}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <Stack.Screen options={{
                title: t('notifications') || 'Notifications',
                headerShown: true,
                headerShadowVisible: false,
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
            }} />

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <NotificationItem item={item} />}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="notifications-off-outline" size={64} color={theme.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No notifications yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    list: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    item: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
        opacity: 0.6,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginLeft: 8,
    },
    empty: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        fontWeight: '500',
    }
});
