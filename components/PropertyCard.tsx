import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Property } from '@/types/property';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PropertyCardProps {
    property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();

    const getVerificationBadge = () => {
        if (property.verification === 'verified') {
            return (
                <View style={[styles.badge, { backgroundColor: Colors.status.verified }]}>
                    <Ionicons name="checkmark-circle" size={12} color="#FFF" />
                    <Text style={styles.badgeText}>Verified</Text>
                </View>
            );
        } else if (property.verification === 'agent') {
            return (
                <View style={[styles.badge, { backgroundColor: Colors.status.agent }]}>
                    <Ionicons name="ribbon" size={12} color="#FFF" />
                    <Text style={styles.badgeText}>Agent</Text>
                </View>
            );
        }
        return null;
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: theme.card, shadowColor: '#000' }]}
            activeOpacity={0.9}
            onPress={() => router.push(`/listing/${property.id}`)}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: property.image }} style={styles.image} resizeMode="cover" />
                <View style={styles.overlay}>
                    <View style={styles.topRow}>
                        {getVerificationBadge()}
                        <TouchableOpacity style={[styles.favoriteBtn, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
                            <Ionicons name="heart-outline" size={20} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.bottomRow}>
                        <View style={[styles.priceTag, { backgroundColor: theme.primary }]}>
                            <Text style={styles.priceText}>
                                {property.currency} {Number(property.price).toLocaleString()}
                                {property.type === 'Rent' && <Text style={{ fontSize: 12, fontWeight: '400' }}>/mo</Text>}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                        {property.title}
                    </Text>
                    {property.rating && (
                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={14} color="#F59E0B" />
                            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>{property.rating}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
                    <Text style={[styles.location, { color: theme.textSecondary }]}>
                        {property.location.district}, {property.location.city}
                    </Text>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.features}>
                    <View style={styles.feature}>
                        <Ionicons name="bed-outline" size={18} color={theme.textSecondary} />
                        <Text style={[styles.featureText, { color: theme.textSecondary }]}>{property.bedrooms} Beds</Text>
                    </View>
                    {property.bathrooms && (
                        <View style={styles.feature}>
                            <Ionicons name="water-outline" size={18} color={theme.textSecondary} />
                            <Text style={[styles.featureText, { color: theme.textSecondary }]}>{property.bathrooms} Baths</Text>
                        </View>
                    )}
                    {property.area && (
                        <View style={styles.feature}>
                            <Ionicons name="scan-outline" size={18} color={theme.textSecondary} />
                            <Text style={[styles.featureText, { color: theme.textSecondary }]}>{property.area.toString()}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        marginBottom: 24,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 6,
    },
    imageContainer: {
        height: 220,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        padding: 16,
        justifyContent: 'space-between',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },
    favoriteBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    priceTag: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    priceText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    content: {
        padding: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#FFF8E1',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 16,
    },
    location: {
        fontSize: 14,
    },
    divider: {
        height: 1,
        marginBottom: 16,
        opacity: 0.5,
    },
    features: {
        flexDirection: 'row',
        gap: 20,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featureText: {
        fontSize: 13,
        fontWeight: '500',
    },
});
