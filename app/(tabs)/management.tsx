import { useI18n } from '@/api/i18n';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useOwnerStats } from '@/hooks/useAnalytics';
import { useProperties } from '@/hooks/useProperties';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ManagementScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { user } = useAuthStore();
    const { data: properties, isLoading, refetch } = useProperties();
    const { data: stats } = useOwnerStats(user?.id || '');
    const { t } = useI18n();

    // Filter properties to show only those owned by the current user
    const myProperties = properties?.filter(p => p.owner.id === user?.id) || [];


    const renderHeader = () => (
        <View style={styles.header}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: theme.text }]}>{t('management')}</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    {t('welcome_sub')}
                </Text>

                <View style={styles.statsRow}>
                    <View style={[styles.statItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{stats?.totalViews || 0}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('views') || 'Views'}</Text>
                    </View>
                    <View style={[styles.statItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Text style={[styles.statValue, { color: theme.text }]}>{myProperties.length}</Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t('listings')}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/post-property')}
            >
                <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={myProperties}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <PropertyCard property={item} />}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderHeader}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIcon, { backgroundColor: theme.primaryLight }]}>
                                <Ionicons name="business-outline" size={48} color={theme.primary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Listings Yet</Text>
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                Start earning by posting your first property listing today.
                            </Text>
                            <Button
                                title="Post New Property"
                                onPress={() => router.push('/post-property')}
                                style={styles.emptyBtn}
                            />
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 24,
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    statItem: {
        flex: 1,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    addButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    emptyContainer: {
        marginTop: 60,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    emptyBtn: {
        width: '100%',
    }
});
