import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAdminProperties, useUpdatePropertyStatus } from '@/hooks/useAdmin';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { data: properties, isLoading, refetch } = useAdminProperties();
    const updateStatus = useUpdatePropertyStatus();

    const pendingProperties = properties?.filter(p => p.verification_status === 'unverified') || [];
    const approvedProperties = properties?.filter(p => p.verification_status === 'verified' || p.verification_status === 'agent') || [];

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateStatus.mutateAsync({ propertyId: id, status });
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const renderPropertyItem = ({ item }: { item: any }) => (
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Image source={{ uri: item.image_url }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.cardOwner, { color: theme.textSecondary }]}>By: {item.owner?.full_name}</Text>
                <View style={styles.actionRow}>
                    {item.verification_status === 'unverified' ? (
                        <>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: Colors.status.verified }]}
                                onPress={() => handleUpdateStatus(item.id, 'verified')}
                            >
                                <Ionicons name="checkmark" size={18} color="#FFF" />
                                <Text style={styles.actionBtnText}>Verify</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: Colors.status.unverified }]}
                                onPress={() => handleUpdateStatus(item.id, 'rejected')}
                            >
                                <Ionicons name="close" size={18} color="#FFF" />
                                <Text style={styles.actionBtnText}>Reject</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <View style={[styles.statusBadge, { backgroundColor: item.verification_status === 'verified' ? theme.primaryLight : '#F3F4F6' }]}>
                            <Ionicons
                                name={item.verification_status === 'verified' ? "shield-checkmark" : "close-circle"}
                                size={14}
                                color={item.verification_status === 'verified' ? theme.primary : '#6B7280'}
                                style={{ marginRight: 4 }}
                            />
                            <Text style={[styles.statusText, { color: item.verification_status === 'verified' ? theme.primary : '#6B7280' }]}>
                                {item.verification_status.toUpperCase()}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Admin Panel</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    Management & Verification
                </Text>
            </View>

            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={properties}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPropertyItem}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.primary} />
                    }
                    ListHeaderComponent={() => (
                        <View style={styles.statsRow}>
                            <View style={[styles.statBox, { backgroundColor: theme.primaryLight }]}>
                                <Text style={[styles.statNum, { color: theme.primary }]}>{pendingProperties.length}</Text>
                                <Text style={[styles.statLabel, { color: theme.primary }]}>Pending</Text>
                            </View>
                            <View style={[styles.statBox, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7', borderWidth: 1 }]}>
                                <Text style={[styles.statNum, { color: '#166534' }]}>{approvedProperties.length}</Text>
                                <Text style={[styles.statLabel, { color: '#166534' }]}>Verified</Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="shield-checkmark-outline" size={64} color={theme.border} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No listings to review</Text>
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
    title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    subtitle: { fontSize: 15, marginTop: 4, fontWeight: '500' },
    list: { paddingHorizontal: 24, paddingBottom: 100 },
    statsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
    statBox: { flex: 1, padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    statNum: { fontSize: 24, fontWeight: '800' },
    statLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 4 },
    card: { flexDirection: 'row', borderRadius: 20, borderWidth: 1, marginBottom: 16, overflow: 'hidden', height: 110 },
    cardImage: { width: 110, height: 110 },
    cardContent: { flex: 1, padding: 12, justifyContent: 'center' },
    cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    cardOwner: { fontSize: 13, marginBottom: 10 },
    actionRow: { flexDirection: 'row', gap: 8 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 6 },
    actionBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
    statusText: { fontSize: 11, fontWeight: '800' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600' }
});
