import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePropertyDetails } from '@/hooks/useProperties';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Dimensions, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const { user } = useAuthStore();
    const { data: property, isLoading, isError } = usePropertyDetails(id as string);

    const handleCall = () => {
        if (property) {
            Linking.openURL(`tel:${property.owner.phone}`);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (isError || !property) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="alert-circle-outline" size={64} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.text }]}>Waan ka xunnahay, xogta lama heli karo.</Text>
                <Button title="Back Home" onPress={() => router.back()} style={{ marginTop: 24 }} />
            </View>
        );
    }

    const isOwner = user?.id === property.owner.name; // Simple mock check

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{
                headerShown: false // Custom header for more control
            }} />

            {/* Header Actions - Moved outside ScrollView for correct overlay */}
            <View style={[styles.floatingHeader, { top: insets.top + (Platform.OS === 'ios' ? 10 : 20) }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.circleBtn, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
                >
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.circleBtn, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
                >
                    <Ionicons name="heart-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: property.image }}
                        style={styles.image}
                        contentFit="cover"
                        transition={500}
                    />
                </View>

                {/* Content Card */}
                <View style={[styles.contentCard, { backgroundColor: theme.card }]}>
                    <View style={styles.indicator} />

                    <View style={styles.headerInfo}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: theme.text }]}>{property.title}</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location" size={16} color={theme.primary} />
                                <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                                    {property.location.district}, {property.location.city}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.priceContainer}>
                            <Text style={[styles.price, { color: theme.primary }]}>
                                {property.currency} {Number(property.price).toLocaleString()}
                            </Text>
                            <Text style={[styles.priceSub, { color: theme.textSecondary }]}>
                                {property.type === 'Rent' ? '/ month' : 'Total Price'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.badgeRow}>
                        <Badge type={property.verification} />
                        <View style={[styles.typeBadge, { backgroundColor: theme.primaryLight }]}>
                            <Text style={[styles.typeText, { color: theme.primary }]}>{property.type}</Text>
                        </View>
                    </View>

                    {/* Feature Grid */}
                    <View style={[styles.featureGrid, { backgroundColor: theme.inputBackground }]}>
                        <View style={styles.featureItem}>
                            <View style={[styles.featureIcon, { backgroundColor: theme.card }]}>
                                <Ionicons name="bed-outline" size={22} color={theme.primary} />
                            </View>
                            <Text style={[styles.featureLabel, { color: theme.textSecondary }]}>Bedrooms</Text>
                            <Text style={[styles.featureValue, { color: theme.text }]}>{property.bedrooms}</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <View style={[styles.featureIcon, { backgroundColor: theme.card }]}>
                                <Ionicons name="water-outline" size={22} color={theme.primary} />
                            </View>
                            <Text style={[styles.featureLabel, { color: theme.textSecondary }]}>Bathrooms</Text>
                            <Text style={[styles.featureValue, { color: theme.text }]}>{property.bathrooms}</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <View style={[styles.featureIcon, { backgroundColor: theme.card }]}>
                                <Ionicons name="expand-outline" size={22} color={theme.primary} />
                            </View>
                            <Text style={[styles.featureLabel, { color: theme.textSecondary }]}>Size</Text>
                            <Text style={[styles.featureValue, { color: theme.text }]}>{property.area.toString()}</Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
                        <Text style={[styles.description, { color: theme.textSecondary }]}>
                            {property.description}
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Location</Text>
                        <View style={[styles.mapPlaceholder, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="map-outline" size={40} color={theme.textSecondary} />
                            <Text style={[styles.mapText, { color: theme.textSecondary }]}>Mogadishu Map Preview</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Contact Bar - Role Aware */}
            <View style={[styles.bottomBar, {
                backgroundColor: theme.card,
                borderTopColor: theme.border,
                paddingBottom: insets.bottom + 20,
                paddingTop: 16
            }]}>
                <View style={styles.ownerRow}>
                    <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                        <Text style={styles.avatarText}>{property.owner.name.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.ownerName, { color: theme.text }]}>{property.owner.name}</Text>
                        <View style={styles.ratingRow}>
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Text style={[styles.ownerRating, { color: theme.textSecondary }]}>
                                {property.owner.rating} Owner
                            </Text>
                        </View>
                    </View>

                    {isOwner ? (
                        <Button
                            title="Manage"
                            onPress={() => { }}
                            size="md"
                            icon="create-outline"
                            style={{ paddingHorizontal: 20 }}
                        />
                    ) : (
                        <Button
                            title="Contact"
                            onPress={handleCall}
                            size="md"
                            icon="call"
                            style={{ paddingHorizontal: 20 }}
                        />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    floatingHeader: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 24,
        right: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    circleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    imageContainer: {
        width: width,
        height: 420,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    contentCard: {
        marginTop: -40,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 24,
        minHeight: 500,
    },
    indicator: {
        width: 40,
        height: 4,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    headerInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 15,
        fontWeight: '500',
    },
    priceContainer: {
        alignItems: 'flex-end',
    },
    price: {
        fontSize: 24,
        fontWeight: '800',
    },
    priceSub: {
        fontSize: 12,
        fontWeight: '600',
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    typeText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    featureGrid: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 24,
        marginBottom: 32,
        justifyContent: 'space-between',
    },
    featureItem: {
        alignItems: 'center',
        flex: 1,
    },
    featureIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    featureLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 2,
    },
    featureValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    description: {
        fontSize: 16,
        lineHeight: 26,
    },
    mapPlaceholder: {
        height: 180,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#CBD5E1',
    },
    mapText: {
        marginTop: 12,
        fontWeight: '600',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 20,
    },
    ownerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    ownerName: {
        fontSize: 16,
        fontWeight: '700',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    ownerRating: {
        fontSize: 13,
    },
    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    contactBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
