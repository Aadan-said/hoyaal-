import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePropertyOffers, useUpdateOfferStatus } from '@/hooks/useOffers';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PropertyOffersScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const { data: offers, isLoading } = usePropertyOffers(id as string);
    const updateStatus = useUpdateOfferStatus();

    const handleAction = (offerId: string, status: 'accepted' | 'rejected') => {
        Alert.alert(
            status === 'accepted' ? 'Accept Offer' : 'Reject Offer',
            `Are you sure you want to ${status} this offer?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => updateStatus.mutate({ offerId, status, propertyId: id as string })
                }
            ]
        );
    };

    if (isLoading) return <LoadingSpinner />;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#F8F9FA' }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={[styles.header, { backgroundColor: theme.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: theme.background }]}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>Property Offers</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={offers}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <View style={[styles.offerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <View style={styles.offerHeader}>
                            <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
                                <Text style={[styles.avatarText, { color: theme.primary }]}>
                                    {item.seeker?.full_name?.charAt(0) || '?'}
                                </Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={[styles.seekerName, { color: theme.text }]}>{item.seeker?.full_name}</Text>
                                <Text style={[styles.offerDate, { color: theme.textSecondary }]}>
                                    {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <Text style={[styles.statusText, { color: theme.primary }]}>{item.status.toUpperCase()}</Text>
                            </View>
                        </View>

                        <View style={styles.offerMain}>
                            <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>Offered Amount</Text>
                            <Text style={[styles.amount, { color: theme.primary }]}>${item.amount?.toLocaleString()}</Text>
                            {item.message && (
                                <Text style={[styles.message, { color: theme.textSecondary }]}>"{item.message}"</Text>
                            )}
                        </View>

                        {item.status === 'pending' && (
                            <View style={styles.actions}>
                                <Button
                                    title="Reject"
                                    onPress={() => handleAction(item.id, 'rejected')}
                                    variant="outline"
                                    style={{ flex: 1, marginRight: 8 }}
                                />
                                <Button
                                    title="Accept"
                                    onPress={() => handleAction(item.id, 'accepted')}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.chatLink}
                            onPress={() => router.push({
                                pathname: '/(tabs)/(shared)/messages',
                                params: {
                                    propertyId: id,
                                    ownerId: item.seeker_id,
                                    initialMessage: `Asc, waxaan rabaa inaan kaala hadlo dalabkaaga aad u dirtay gurigayga.`
                                }
                            })}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.primary} />
                            <Text style={{ color: theme.primary, fontWeight: '700', marginLeft: 8 }}>Chat with Applicant</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="document-text-outline" size={64} color={theme.textSecondary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No offers yet.</Text>
                    </View>
                }
            />
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
    title: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
    list: { padding: 20 },
    offerCard: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
    },
    offerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontWeight: '700' },
    seekerName: { fontSize: 16, fontWeight: '700' },
    offerDate: { fontSize: 12 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#f1f5f9' },
    statusText: { fontSize: 10, fontWeight: '800' },
    offerMain: { marginBottom: 20 },
    amountLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
    amount: { fontSize: 24, fontWeight: '800' },
    message: { fontSize: 14, marginTop: 8, fontStyle: 'italic' },
    actions: { flexDirection: 'row', marginTop: 12 },
    chatLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 16, fontSize: 16, fontWeight: '600' }
});
