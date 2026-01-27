import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Property } from '@/types/property';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PropertyCardProps {
    property: Property;
    onPress?: () => void;
}

export function PropertyCard({ property, onPress }: PropertyCardProps) {
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

    const handlePress = () => {
        if (onPress) {
            onPress();
        } else {
            router.push(`/listing/${property.id}`);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <View style={styles.imageContainer}>
                <Image source={{ uri: property.image }} style={styles.image} />
                <View style={styles.priceContainer}>
                    <Text style={[styles.price, { color: '#FFF' }]}>
                        ${property.price.toLocaleString()}
                    </Text>
                    <Text style={[styles.priceType, { color: '#FFF' }]}>
                        {property.type}
                    </Text>
                </View>
                {getVerificationBadge()}
            </View>

            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
                    {property.title}
                </Text>

                <View style={styles.location}>
                    <Ionicons name="location" size={14} color={theme.textSecondary} />
                    <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                        {property.location.district}, {property.location.city}
                    </Text>
                </View>

                <View style={styles.features}>
                    <View style={styles.feature}>
                        <Ionicons name="bed" size={16} color={theme.textSecondary} />
                        <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                            {property.bedrooms} Beds
                        </Text>
                    </View>
                    <View style={styles.feature}>
                        <Ionicons name="water" size={16} color={theme.textSecondary} />
                        <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                            {property.bathrooms} Baths
                        </Text>
                    </View>
                    <View style={styles.feature}>
                        <Ionicons name="square" size={16} color={theme.textSecondary} />
                        <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                            {property.area} sqft
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.owner}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                            <Text style={styles.avatarText}>
                                {property.owner.name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.ownerInfo}>
                            <Text style={[styles.ownerName, { color: theme.text }]}>
                                {property.owner.name}
                            </Text>
                            <View style={styles.rating}>
                                <Ionicons name="star" size={12} color="#F59E0B" />
                                <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                                    {property.owner.rating.toFixed(1)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: 200,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    priceContainer: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backdropFilter: 'blur(10px)',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
    },
    priceType: {
        fontSize: 12,
        opacity: 0.9,
    },
    badge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 11,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        lineHeight: 24,
    },
    location: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    locationText: {
        fontSize: 14,
        flex: 1,
    },
    features: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    featureText: {
        fontSize: 13,
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 12,
    },
    owner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
    },
    ownerInfo: {
        flex: 1,
    },
    ownerName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
    },
});
