import { PropertyCard } from '@/components/ui/PropertyCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/useNotifications';
import { useProfile } from '@/hooks/useProfile';
import { useDeleteProperty, useOwnerProperties } from '@/hooks/useProperties';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OwnerManagementScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const { data: properties, isLoading, refetch, isRefetching } = useOwnerProperties(user?.id);
    const { data: profile } = useProfile(user?.id || '');
    const { data: notifications } = useNotifications(user?.id || '');
    const deleteProperty = useDeleteProperty();

    const handleDelete = (id: string) => {
        Alert.alert(
            "Ma hubtaa?",
            "Ma hubtaa inaad tirtirto gurigan? Ka noqosho ma lahan.",
            [
                { text: "Maya", style: "cancel" },
                {
                    text: "Haa, Tirtir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteProperty.mutateAsync(id);
                        } catch (error) {
                            Alert.alert("Cilad", "Waan tirtiri waayay guriga.");
                        }
                    }
                }
            ]
        );
    };

    const unreadNotifications = notifications?.filter(n => !n.is_read).length || 0;
    const [activeTab, setActiveTab] = useState<'All' | 'Verified' | 'Pending'>('All');

    // Calculated Stats
    const totalViews = properties?.reduce((acc: number, p: any) => acc + (p.views || 0), 0) || 0;
    const totalListings = properties?.length || 0;
    const verifiedListings = properties?.filter((p: any) => p.verification === 'verified').length || 0;

    const filteredProperties = properties?.filter((p: any) => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Verified') return p.verification === 'verified';
        if (activeTab === 'Pending') return p.verification === 'pending' || p.verification === 'unverified';
        return true;
    });

    const StatCard = ({ label, value, icon, color, type }: any) => (
        <TouchableOpacity
            style={[styles.statCard, { backgroundColor: theme.card }, activeTab === type && { borderColor: color, borderWidth: 1 }]}
            onPress={() => setActiveTab(type)}
        >
            <LinearGradient
                colors={[color + '10', 'transparent']}
                style={styles.statGradient}
            />
            <View style={[styles.statIcon, { backgroundColor: color }]}>
                <Ionicons name={icon} size={18} color="#FFF" />
            </View>
            <View>
                <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: '#F8F9FA' }]}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
            >
                {/* Header Section */}
                <View style={[styles.header, { backgroundColor: theme.background, paddingTop: insets.top + 20 }]}>
                    <LinearGradient
                        colors={[theme.primaryLight, 'transparent']}
                        style={styles.headerGradient}
                    />
                    <View style={styles.headerContent}>
                        <View style={styles.headerTop}>
                            <View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text style={[styles.headerTitle, { color: theme.text }]}>Guryahay</Text>
                                </View>
                                <View style={styles.balanceRow}>
                                    <Ionicons name="wallet-outline" size={14} color={theme.primary} />
                                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                                        Balance: <Text style={{ color: theme.primary, fontWeight: '700' }}>${profile?.balance?.toFixed(2) || '0.00'}</Text>
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.headerActions}>
                                <TouchableOpacity
                                    style={[styles.headerIconBtn, { backgroundColor: theme.card }]}
                                    onPress={() => router.push('/notifications')}
                                >
                                    <Ionicons name="notifications-outline" size={22} color={theme.text} />
                                    {unreadNotifications > 0 && (
                                        <View style={styles.unreadBadge}>
                                            <Text style={styles.unreadText}>{unreadNotifications}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.addButtonSmall, { backgroundColor: theme.primary }]}
                                    onPress={() => router.push('/post-property')}
                                >
                                    <Ionicons name="add" size={26} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <StatCard label="VIEWS" value={totalViews} icon="eye" color="#3B82F6" type="All" />
                        <StatCard label="LISTINGS" value={totalListings} icon="business" color="#10B981" type="All" />
                        <StatCard label="VERIFIED" value={verifiedListings} icon="shield-checkmark" color="#8B5CF6" type="Verified" />
                    </View>

                    {/* Tabs */}
                    <View style={styles.tabsContainer}>
                        {['All', 'Verified', 'Pending'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab as any)}
                                style={[
                                    styles.tab,
                                    activeTab === tab ? styles.activeTab : null,
                                ]}
                            >
                                <Text style={[
                                    styles.tabText,
                                    { color: activeTab === tab ? theme.primary : theme.textSecondary, fontWeight: activeTab === tab ? '700' : '500' }
                                ]}>
                                    {tab === 'All' ? 'Dhammaan' : tab === 'Verified' ? 'La Hubiyay' : 'Sugaya'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Properties List */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.primary} />
                    </View>
                ) : filteredProperties && filteredProperties.length > 0 ? (
                    <View style={{ padding: 20, gap: 16 }}>
                        {filteredProperties.map((item: any) => (
                            <View key={item.id} style={[styles.unifiedCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <PropertyCard
                                    property={item}
                                    onPress={() => router.push(`/listing/${item.id}`)}
                                />
                                <View style={[styles.propertyActions, { borderTopColor: theme.border + '20' }]}>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                                        onPress={() => router.push({
                                            pathname: '/owner/offers/[id]',
                                            params: { id: item.id }
                                        })}
                                    >
                                        <View style={styles.actionBtnContent}>
                                            <Ionicons name="document-text" size={16} color="#FFF" />
                                            <Text style={[styles.actionBtnText, { color: '#FFF' }]} numberOfLines={1}>Offers</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: theme.inputBackground, borderWidth: 1, borderColor: theme.border }]}
                                        onPress={() => router.push(`/post-property?edit=${item.id}`)}
                                    >
                                        <View style={styles.actionBtnContent}>
                                            <Ionicons name="create-outline" size={16} color={theme.textSecondary} />
                                            <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>Edit</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: theme.error + '10', borderWidth: 1, borderColor: theme.error + '40' }]}
                                        onPress={() => handleDelete(item.id)}
                                    >
                                        <View style={styles.actionBtnContent}>
                                            <Ionicons name="trash-outline" size={16} color={theme.error} />
                                            <Text style={[styles.actionBtnText, { color: theme.error }]}>Delete</Text>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="home-outline" size={48} color={theme.textSecondary} />
                        <Text style={{ color: theme.textSecondary, marginTop: 12 }}>No properties found.</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        backgroundColor: '#FFF',
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        zIndex: 10,
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 150,
    },
    headerContent: {
        paddingHorizontal: 24,
        paddingBottom: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    balanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    addButtonSmall: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    headerIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    unreadBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    unreadText: {
        color: '#FFF',
        fontSize: 8,
        fontWeight: '900',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#FFF',
        overflow: 'hidden',
    },
    statGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    statIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        opacity: 0.6,
    },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 20,
        gap: 8,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
    },
    activeTab: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
    },
    unifiedCard: {
        borderRadius: 24,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    propertyActions: {
        flexDirection: 'row',
        gap: 8,
        padding: 12,
        borderTopWidth: 1,
    },
    actionBtn: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    actionBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 8,
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '800',
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 4,
    },
    premiumBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '900',
    },
    premiumBanner: {
        marginHorizontal: 24,
        padding: 18,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    premiumBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    premiumTitle: {
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    premiumSub: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
});
