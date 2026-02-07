import { useI18n } from '@/api/i18n';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import MapView, { Marker } from '@/components/ui/UniversalMapView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTrackView } from '@/hooks/useAnalytics';
import { useFavorites } from '@/hooks/useFavorites';
import { useCreateOffer } from '@/hooks/useOffers';
import { usePropertyDetails } from '@/hooks/useProperties';
import { useCreateReport } from '@/hooks/useReports';
import { useAddReview, usePropertyReviews } from '@/hooks/useReviews';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';


import { ActivityIndicator, Dimensions, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const AMENITIES_LIST = [
    { id: 'wifi', label: 'WiFi', icon: 'wifi-outline' },
    { id: 'parking', label: 'Parking', icon: 'car-outline' },
    { id: 'ac', label: 'AC', icon: 'snow-outline' },
    { id: 'security', label: 'Security', icon: 'shield-checkmark-outline' },
    { id: 'gym', label: 'Gym', icon: 'fitness-outline' },
    { id: 'pool', label: 'Pool', icon: 'water-outline' },
    { id: 'furnished', label: 'Furnished', icon: 'bed-outline' },
    { id: 'kitchen', label: 'Kitchen', icon: 'restaurant-outline' },
];

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
};

export default function ListingDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const { user, isAuthenticated } = useAuthStore();
    const { data: property, isLoading, isError } = usePropertyDetails(id as string);
    const { favorites, toggleFavorite, isToggling } = useFavorites();
    const { mutate: trackView } = useTrackView();
    const { data: reviews } = usePropertyReviews(id as string);
    const addReview = useAddReview();
    const { t } = useI18n();

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [offerAmount, setOfferAmount] = useState('');
    const [offerMessage, setOfferMessage] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportType, setReportType] = useState<'property' | 'user'>('property');
    const [reportReason, setReportReason] = useState('');
    const [reportDetails, setReportDetails] = useState('');

    const createOffer = useCreateOffer();
    const createReport = useCreateReport();

    const REPORT_REASONS = [
        'Fraudulent/Scam',
        'Incorrect Details',
        'Duplicate Listing',
        'Inappropriate Content',
        'Other'
    ];

    useEffect(() => {
        if (id && user) {
            trackView({ propertyId: id as string, userId: user.id });
        }
    }, [id, user]);

    const isFavorite = favorites.includes(id as string);

    const handleAddReview = async () => {
        if (!user || !id) return;
        if (!comment) return;
        try {
            await addReview.mutateAsync({
                propertyId: id as string,
                reviewerId: user.id,
                rating,
                comment
            });
            setRating(5);
            setComment('');
            setShowReviewForm(false);
            alert('Mahadsanid! Review-gaagu waa na soo gaaray.');
        } catch (error) {
            console.error("Failed to add review", error);
        }
    };

    const handleMakeOffer = async () => {
        try {
            await createOffer.mutateAsync({
                propertyId: id as string,
                amount: offerAmount ? parseFloat(offerAmount) : property?.price,
                message: offerMessage || `Hi, I'm interested in ${property?.type === 'Rent' ? 'renting' : 'buying'} this property.`
            });

            // Auto-send first chat message
            router.push({
                pathname: '/(tabs)/(shared)/messages',
                params: {
                    propertyId: property?.id,
                    ownerId: property?.owner.id,
                    initialMessage: `I just submitted an offer for ${property?.title}. Amount: ${offerAmount || property?.price}`
                }
            });

            setShowOfferModal(false);
            setOfferAmount('');
            setOfferMessage('');
            alert('Codsigaga waa loo diray owner-ka!');
        } catch (error) {
            console.error("Failed to submit offer", error);
            alert('Waan ka xunnahay, codsiga ma dirmin.');
        }
    };



    const handleReportSubmit = async () => {
        if (!reportReason) return;
        try {
            await createReport.mutateAsync({
                property_id: reportType === 'property' ? id as string : undefined,
                profile_id: reportType === 'user' ? property?.owner.id : undefined,
                reason: reportReason,
                details: reportDetails
            });
            setShowReportModal(false);
            setReportReason('');
            setReportDetails('');
            alert('Mahadsanid, waaan helnay warbixintaada!');
        } catch (error) {
            console.error("Failed to submit report", error);
            alert('Waan ka xunnahay, warbixinta ma dirmin.');
        }
    };

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

    const isActuallyOwner = !!user?.id && !!property?.owner?.id && user.id === property.owner.id;
    const isUserSeeker = user?.role === 'SEEKER';
    const showManageButton = isActuallyOwner && !isUserSeeker;


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
                    onPress={() => property && toggleFavorite(property.id)}
                    disabled={isToggling}
                    style={[styles.circleBtn, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
                >
                    <Ionicons
                        name={isFavorite ? "heart" : "heart-outline"}
                        size={24}
                        color={isFavorite ? "#EF4444" : "#000"}
                    />
                </TouchableOpacity>

            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Image */}
                {/* Hero Image Carousel */}
                <View style={styles.imageContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                    >
                        {(property.images && property.images.length > 0 ? property.images : [property.image]).map((img, index) => (
                            <Image
                                key={index}
                                source={{ uri: img }}
                                style={styles.image}
                                contentFit="cover"
                                transition={500}
                            />
                        ))}
                    </ScrollView>
                    {/* Page Indicator */}
                    {property.images && property.images.length > 1 && (
                        <View style={styles.carouselIndicator}>
                            <Text style={styles.carouselText}>
                                1/{property.images.length}
                            </Text>
                        </View>
                    )}
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
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Description</Text>
                            <TouchableOpacity onPress={() => {
                                setReportType('property');
                                setShowReportModal(true);
                            }}>
                                <View style={styles.reportBtn}>
                                    <Ionicons name="flag-outline" size={16} color={theme.error} />
                                    <Text style={[styles.reportBtnText, { color: theme.error }]}>Report</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.description, { color: theme.textSecondary }]}>
                            {property.description}
                        </Text>
                    </View>

                    {property.amenities && property.amenities.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Amenities</Text>
                            <View style={styles.amenitiesGrid}>
                                {property.amenities.map((amenityId) => {
                                    const amenity = AMENITIES_LIST.find(a => a.id === amenityId);
                                    if (!amenity) return null;
                                    return (
                                        <View key={amenityId} style={[styles.amenityBadge, { backgroundColor: theme.inputBackground }]}>
                                            <Ionicons name={amenity.icon as any} size={20} color={theme.primary} />
                                            <Text style={[styles.amenityBadgeText, { color: theme.text }]}>{amenity.label}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('location')}</Text>
                        <View style={[styles.mapContainer, { borderColor: theme.border }]}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: property.latitude || 2.0469,
                                    longitude: property.longitude || 45.3182,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: property.latitude || 2.0469,
                                        longitude: property.longitude || 45.3182
                                    }}
                                />
                            </MapView>
                        </View>
                    </View>

                    {/* Reviews Section */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('reviews')}</Text>
                            {!isActuallyOwner && (
                                <TouchableOpacity onPress={() => setShowReviewForm(!showReviewForm)}>
                                    <Text style={{ color: theme.primary, fontWeight: '700' }}>
                                        {showReviewForm ? 'Cancel' : 'Write a Review'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {showReviewForm && (
                            <View style={[styles.reviewForm, { backgroundColor: theme.inputBackground }]}>
                                <View style={styles.ratingPicker}>
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <TouchableOpacity key={s} onPress={() => setRating(s)}>
                                            <Ionicons
                                                name={s <= rating ? "star" : "star-outline"}
                                                size={32}
                                                color={s <= rating ? "#F59E0B" : theme.textSecondary}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TextInput
                                    style={[styles.reviewInput, { color: theme.text, backgroundColor: theme.card, borderColor: theme.border }]}
                                    placeholder="Share your experience..."
                                    placeholderTextColor={theme.textSecondary}
                                    multiline
                                    value={comment}
                                    onChangeText={setComment}
                                />
                                <Button
                                    title="Submit Review"
                                    onPress={handleAddReview}
                                    isLoading={addReview.isPending}
                                    style={{ marginTop: 12 }}
                                />

                            </View>
                        )}

                        {reviews && reviews.length > 0 ? (
                            reviews.map((rev: any) => (
                                <View key={rev.id} style={[styles.reviewCard, { backgroundColor: theme.inputBackground }]}>
                                    <View style={styles.reviewMain}>
                                        <View style={[styles.reviewerAvatar, { backgroundColor: theme.primaryLight }]}>
                                            <Text style={[styles.avatarTextSmall, { color: theme.primary }]}>
                                                {rev.reviewer?.full_name ? rev.reviewer.full_name.charAt(0).toUpperCase() : '?'}
                                            </Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.reviewHeader}>
                                                <Text style={[styles.reviewerName, { color: theme.text }]}>
                                                    {rev.reviewer?.full_name || 'Anonymous User'}
                                                </Text>
                                                <Text style={[styles.reviewDate, { color: theme.textSecondary }]}>
                                                    {formatTimeAgo(rev.created_at)}
                                                </Text>
                                            </View>
                                            <View style={styles.ratingRowSmall}>
                                                {[...Array(5)].map((_, i) => (
                                                    <Ionicons
                                                        key={i}
                                                        name={i < rev.rating ? "star" : "star-outline"}
                                                        size={12}
                                                        color="#F59E0B"
                                                    />
                                                ))}
                                            </View>
                                            <Text style={[styles.reviewComment, { color: theme.textSecondary }]}>{rev.comment}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={{ color: theme.textSecondary, fontStyle: 'italic' }}>No reviews yet.</Text>
                        )}
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
                <View style={[styles.ownerSection, { backgroundColor: theme.inputBackground }]}>
                    <View style={styles.ownerInfo}>
                        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
                            <Text style={styles.avatarText}>{property.owner.name.charAt(0)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={[styles.ownerName, { color: theme.text }]}>{property.owner.name}</Text>
                                {!isActuallyOwner && (
                                    <TouchableOpacity
                                        style={styles.flagBtn}
                                        onPress={() => {
                                            setReportType('user');
                                            setShowReportModal(true);
                                        }}
                                    >
                                        <Ionicons name="flag-outline" size={14} color={theme.error} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={12} color="#F59E0B" />
                                <Text style={[styles.ownerRating, { color: theme.textSecondary }]}>
                                    {property.owner.rating} • 12 Properties
                                </Text>
                            </View>
                        </View>
                        <View style={styles.ownerActions}>
                            <TouchableOpacity style={[styles.iconActionBtn, { backgroundColor: theme.card }]} onPress={handleCall}>
                                <Ionicons name="call-outline" size={20} color={theme.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconActionBtn, { backgroundColor: theme.card }]}
                                onPress={() => router.push({
                                    pathname: '/(tabs)/(shared)/messages',
                                    params: { propertyId: property.id, ownerId: property.owner.id }
                                })}
                            >
                                <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {showManageButton ? (
                    <Button
                        title="Manage Listing"
                        onPress={() => router.push(`/post-property?edit=${property.id}`)}
                        size="lg"
                        icon="create-outline"
                        style={{ marginTop: 12 }}
                    />
                ) : (
                    <View style={styles.seekerActions}>
                        <TouchableOpacity
                            style={[styles.actionBtnPrimary, { backgroundColor: theme.primary }]}
                            onPress={() => setShowOfferModal(true)}
                        >
                            <LinearGradient
                                colors={['rgba(255,255,255,0.2)', 'transparent']}
                                style={styles.btnGradient}
                            />
                            <Ionicons name="flash" size={20} color="#FFF" />
                            <Text style={styles.actionBtnTextPrimary}>Dalbo Hadda</Text>
                        </TouchableOpacity>

                        <View style={styles.contactButtons}>
                            <TouchableOpacity
                                style={[styles.actionBtnSecondary, { backgroundColor: theme.inputBackground, borderWidth: 1, borderColor: theme.border }]}
                                onPress={handleCall}
                            >
                                <Ionicons name="call" size={20} color={theme.primary} />
                                <Text style={[styles.actionBtnTextSecondary, { color: theme.text }]}>Wicid</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionBtnSecondary, { backgroundColor: theme.inputBackground, borderWidth: 1, borderColor: theme.border }]}
                                onPress={() => router.push({
                                    pathname: '/(tabs)/(shared)/messages',
                                    params: { propertyId: property.id, ownerId: property.owner.id }
                                })}
                            >
                                <Ionicons name="chatbubble-ellipses" size={20} color={theme.primary} />
                                <Text style={[styles.actionBtnTextSecondary, { color: theme.text }]}>Fariin</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Offer Modal */}
                <Modal
                    visible={showOfferModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowOfferModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Submit Offer</Text>
                                <TouchableOpacity onPress={() => setShowOfferModal(false)}>
                                    <Ionicons name="close" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>
                                    Your {property.type === 'Rent' ? 'Monthly' : 'Total'} Offer ($)
                                </Text>
                                <TextInput
                                    style={[styles.modalInput, { color: theme.text, borderColor: theme.border }]}
                                    keyboardType="numeric"
                                    placeholder={property.price.toString()}
                                    placeholderTextColor={theme.textSecondary}
                                    value={offerAmount}
                                    onChangeText={setOfferAmount}
                                />

                                <Text style={[styles.modalLabel, { color: theme.textSecondary, marginTop: 16 }]}>
                                    Message to Owner
                                </Text>
                                <TextInput
                                    style={[styles.modalInput, { color: theme.text, borderColor: theme.border, height: 100 }]}
                                    multiline
                                    placeholder="Introduce yourself or ask a question..."
                                    placeholderTextColor={theme.textSecondary}
                                    value={offerMessage}
                                    onChangeText={setOfferMessage}
                                />

                                <Button
                                    title="Xaqiiji Dalabka"
                                    onPress={handleMakeOffer}
                                    isLoading={createOffer.isPending}
                                    style={{ marginTop: 24 }}
                                />
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Report Modal */}
                <Modal
                    visible={showReportModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowReportModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>
                                    {reportType === 'property' ? 'Report Property' : 'Report User'}
                                </Text>
                                <TouchableOpacity onPress={() => setShowReportModal(false)}>
                                    <Ionicons name="close" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Select Reason</Text>
                                <View style={styles.reasonGrid}>
                                    {REPORT_REASONS.map((reason) => (
                                        <TouchableOpacity
                                            key={reason}
                                            style={[
                                                styles.reasonItem,
                                                { borderColor: theme.border },
                                                reportReason === reason && { borderColor: theme.primary, backgroundColor: theme.primaryLight }
                                            ]}
                                            onPress={() => setReportReason(reason)}
                                        >
                                            <Text style={[
                                                styles.reasonText,
                                                { color: theme.textSecondary },
                                                reportReason === reason && { color: theme.primary, fontWeight: '700' }
                                            ]}>{reason}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={[styles.modalLabel, { color: theme.textSecondary, marginTop: 16 }]}>
                                    Additional Details (Optional)
                                </Text>
                                <TextInput
                                    style={[styles.modalInput, { color: theme.text, borderColor: theme.border, height: 100 }]}
                                    multiline
                                    placeholder="Tell us more about the issue..."
                                    placeholderTextColor={theme.textSecondary}
                                    value={reportDetails}
                                    onChangeText={setReportDetails}
                                />

                                <Button
                                    title="Submit Report"
                                    onPress={handleReportSubmit}
                                    isLoading={createReport.isPending}
                                    style={{ marginTop: 24, backgroundColor: theme.error }}
                                />
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
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
        width: width,
        height: 420,
    },
    carouselIndicator: {
        position: 'absolute',
        bottom: 50,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    carouselText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
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
    mapContainer: {
        height: 200,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        marginTop: 8,
    },
    map: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    reviewForm: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
    },
    ratingPicker: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
        justifyContent: 'center',
    },
    reviewInput: {
        height: 100,
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        textAlignVertical: 'top',
        fontSize: 15,
    },
    reviewItem: {
        marginBottom: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    reviewerName: {
        fontSize: 15,
        fontWeight: '700',
    },
    reviewComment: {
        fontSize: 14,
        lineHeight: 20,
    },
    reviewCard: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
    },
    reviewMain: {
        flexDirection: 'row',
        gap: 12,
    },
    reviewerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarTextSmall: {
        fontSize: 16,
        fontWeight: '800',
    },
    reviewDate: {
        fontSize: 12,
        fontWeight: '500',
    },
    ratingRowSmall: {
        flexDirection: 'row',
        gap: 2,
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 20,
        borderTopWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -15 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 30,
    },
    ownerSection: {
        borderRadius: 24,
        padding: 16,
        marginBottom: 20,
    },
    ownerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 22,
        fontWeight: 'bold',
    },
    ownerName: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    ownerRating: {
        fontSize: 13,
        fontWeight: '600',
    },
    ownerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    iconActionBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    seekerActions: {
        gap: 12,
    },
    actionBtnPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 20,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 5,
        overflow: 'hidden',
    },
    btnGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    actionBtnTextPrimary: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    contactButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtnSecondary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 20,
        gap: 10,
    },
    actionBtnTextSecondary: {
        fontSize: 15,
        fontWeight: '800',
    },
    flagBtn: {
        padding: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    modalLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
    },
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },
    amenityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 16,
        gap: 8,
    },
    amenityBadgeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    reportBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    reportBtnText: {
        fontSize: 13,
        fontWeight: '600',
    },
    reasonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 8,
    },
    reasonItem: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    reasonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    modalInput: {
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        textAlignVertical: 'top',
    },
});


