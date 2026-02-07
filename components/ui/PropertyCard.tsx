import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthStore } from '@/store/useAuthStore';
import { Property } from '@/types/property';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    const { isAuthenticated } = useAuthStore();
    const { favorites, toggleFavorite, isToggling } = useFavorites();

    const isFavorite = favorites.includes(property.id);


    const getStatusBadge = () => {
        if (property.status === 'available') return null;

        const colors: any = {
            pending: '#F59E0B',
            rented: '#3B82F6',
            sold: '#EF4444'
        };

        return (
            <View style={[styles.statusBadge, { backgroundColor: colors[property.status || 'pending'] }]}>
                <Text style={styles.statusBadgeText}>{property.status?.toUpperCase()}</Text>
            </View>
        );
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
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                />

                <View style={[styles.typeBadge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.typeText}>{property.type.toUpperCase()}</Text>
                </View>

                <View style={styles.infoOverlay}>
                    <Text style={styles.price}>
                        {property.currency} {Number(property.price).toLocaleString()}
                    </Text>
                    {property.type === 'Rent' && <Text style={styles.pricePeriod}>/month</Text>}
                </View>

                {isAuthenticated && (
                    <TouchableOpacity
                        style={[styles.favoriteBtn, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
                        onPress={() => toggleFavorite(property.id)}
                        disabled={isToggling}
                    >
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={22}
                            color={isFavorite ? "#EF4444" : "#6B7280"}
                        />
                    </TouchableOpacity>
                )}

                {getStatusBadge()}
            </View>


            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                    {property.title}
                </Text>

                <View style={styles.location}>
                    <Ionicons name="location-outline" size={14} color={theme.primary} />
                    <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                        {property.location.district}, {property.location.city}
                    </Text>
                </View>

                <View style={[styles.featuresRow, { backgroundColor: theme.inputBackground }]}>
                    <View style={styles.feature}>
                        <Ionicons name="bed-outline" size={14} color={theme.text} />
                        <Text style={[styles.featureText, { color: theme.text }]}>{property.bedrooms}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.feature}>
                        <Ionicons name="water-outline" size={14} color={theme.text} />
                        <Text style={[styles.featureText, { color: theme.text }]}>{property.bathrooms}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.feature}>
                        <Ionicons name="expand-outline" size={14} color={theme.text} />
                        <Text style={[styles.featureText, { color: theme.text }]}>{property.area}</Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.owner}>
                        <View style={[styles.avatar, { backgroundColor: theme.primaryLight }]}>
                            <Text style={[styles.avatarText, { color: theme.primary }]}>
                                {property.owner.name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.ownerInfo}>
                            <Text style={[styles.ownerName, { color: theme.text }]}>
                                {property.owner.name}
                            </Text>
                            <View style={styles.rating}>
                                <Ionicons name="star" size={10} color="#F59E0B" />
                                <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
                                    {property.owner.rating.toFixed(1)}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.detailsBtn, { backgroundColor: theme.primaryLight }]}>
                            <Ionicons name="chevron-forward" size={16} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: 220,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    infoOverlay: {
        position: 'absolute',
        bottom: 16,
        left: 16,
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    price: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFF',
    },
    pricePeriod: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    typeBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    typeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#FFF',
    },
    badge: {
        position: 'absolute',
        top: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    badgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 19,
        fontWeight: '700',
        marginBottom: 6,
        letterSpacing: -0.3,
    },
    location: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    locationText: {
        fontSize: 14,
        fontWeight: '500',
    },
    featuresRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        marginBottom: 20,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        justifyContent: 'center',
    },
    featureText: {
        fontSize: 14,
        fontWeight: '700',
    },
    divider: {
        width: 1,
        height: 12,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    footer: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 16,
    },
    owner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 15,
        fontWeight: '800',
    },
    ownerInfo: {
        flex: 1,
    },
    ownerName: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    rating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
    },
    detailsBtn: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteBtn: {
        position: 'absolute',
        top: 16,
        right: 16, // Move to top right next to badges if verified
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 10,
    },
    statusBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        zIndex: 11,
    },
    statusBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '800',
    },
});

