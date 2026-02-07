import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { useCreateProperty, usePropertyDetails, useUpdateProperty } from '@/hooks/useProperties';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocationStore } from '@/store/useLocationStore';
import { uploadImageToSupabase } from '@/utils/upload';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PostPropertyScreen() {
    const router = useRouter();
    const { edit } = useLocalSearchParams();
    const isEdit = !!edit;
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const { user } = useAuthStore();
    const { canPostProperty } = useAuth();
    const { location: userLocation } = useLocationStore();
    const createProperty = useCreateProperty();
    const updateProperty = useUpdateProperty();
    const { data: propertyToEdit, isLoading: loadingProperty } = usePropertyDetails(edit as string);

    // Add useEffect to pre-fill data when editing
    useEffect(() => {
        if (isEdit && propertyToEdit) {
            setTitle(propertyToEdit.title);
            setDescription(propertyToEdit.description || '');
            setPrice(propertyToEdit.price.toString());
            setArea(propertyToEdit.area.toString());
            setType(propertyToEdit.type as any);
            setCity(propertyToEdit.location.city);
            setDistrict(propertyToEdit.location.district || '');
            setBedrooms(propertyToEdit.bedrooms.toString());
            setBathrooms(propertyToEdit.bathrooms.toString());
            setImages(propertyToEdit.images || [propertyToEdit.image]);
            setSelectedAmenities(propertyToEdit.amenities || []);
            setLocation({
                latitude: propertyToEdit.latitude || 2.0469,
                longitude: propertyToEdit.longitude || 45.3182,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        }
    }, [isEdit, propertyToEdit]);

    // Check if user can post properties
    React.useEffect(() => {
        if (!canPostProperty()) {
            Alert.alert(
                'Access Denied',
                'Only Owners, Agents, and Admins can post properties.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        }
    }, [canPostProperty, router]);

    useEffect(() => {
        if (userLocation) {
            setLocation(prev => ({
                ...prev,
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
            }));
        }
    }, [userLocation]);

    const [currentStep, setCurrentStep] = useState(1);
    const [type, setType] = useState<'Rent' | 'Sale'>('Rent');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [area, setArea] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [bedrooms, setBedrooms] = useState('0');
    const [bathrooms, setBathrooms] = useState('0');
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [location, setLocation] = useState({
        latitude: 2.0469, // Mogadishu default
        longitude: 45.3182,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const AMENITIES = [
        { id: 'wifi', label: 'WiFi', icon: 'wifi-outline' },
        { id: 'parking', label: 'Parking', icon: 'car-outline' },
        { id: 'ac', label: 'AC', icon: 'snow-outline' },
        { id: 'security', label: 'Security', icon: 'shield-checkmark-outline' },
        { id: 'gym', label: 'Gym', icon: 'fitness-outline' },
        { id: 'pool', label: 'Pool', icon: 'water-outline' },
        { id: 'furnished', label: 'Furnished', icon: 'bed-outline' },
        { id: 'kitchen', label: 'Kitchen', icon: 'restaurant-outline' },
    ];

    const totalSteps = 3;

    const handleNext = () => {
        if (currentStep === 1) {
            if (!title) return Alert.alert('Error', 'Please provide a title');
            if (!description) return Alert.alert('Error', 'Please provide a description');
        }
        if (currentStep === 2) {
            if (!price) return Alert.alert('Error', 'Please provide a price');
            if (!area) return Alert.alert('Error', 'Please provide the area size');
        }
        if (currentStep < totalSteps) setCurrentStep(s => s + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(s => s - 1);
        else router.back();
    };


    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 10 - images.length,
            quality: 0.8,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setImages([...images, ...newImages]);
        }
    };

    const handleSubmit = async () => {
        if (!title || !price || !city) {
            Alert.alert('Missing Info', 'Please fill in the title, price, and city.');
            return;
        }

        try {
            setUploading(true);
            const uploadedImageUrls = await Promise.all(
                images.map(async (img) => {
                    if (img.startsWith('http')) return img; // Already uploaded
                    return await uploadImageToSupabase(img);
                })
            );

            const propertyData = {
                title,
                description,
                price: parseFloat(price),
                currency: 'USD',
                type,
                location: { city, district },
                area,
                image: uploadedImageUrls[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop', // Main image
                images: uploadedImageUrls, // All images
                bedrooms: parseInt(bedrooms) || 0,
                bathrooms: parseInt(bathrooms) || 0,
                verification: 'unverified' as any,
                latitude: location.latitude,
                longitude: location.longitude,
                amenities: selectedAmenities,
                created_at: propertyToEdit?.created_at || new Date().toISOString(),
                owner: {
                    id: user?.id || '',
                    name: user?.name || '',
                    phone: user?.phone || '',
                    rating: 5.0
                }
            };

            if (isEdit) {
                await updateProperty.mutateAsync({
                    id: edit as string,
                    updates: propertyData
                });
                Alert.alert('Guri la cusubadeeyay', 'Xogta gurigaaga si guul leh ayaa loo cusubadeeyay.');
            } else {
                await createProperty.mutateAsync(propertyData);
                Alert.alert('Guri cusub', 'Gurigan si guul leh ayaa loo soo dhigay.');
            }
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', isEdit ? 'Cusboonaysiinta way fashilantay.' : 'Failed to publish listing. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const InputLabel = ({ label }: { label: string }) => (
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.inputBackground }]}>
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                    {isEdit ? 'Cusboonaysii Guriga' : 'Soo dhig Guri'}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={[styles.draftText, { color: theme.primary }]}>Draft</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {loadingProperty && isEdit ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: 400 }}>
                            <ActivityIndicator size="large" color={theme.primary} />
                        </View>
                    ) : (
                        <>
                            {/* Progress Indicator */}
                            <View style={styles.progressContainer}>
                                <View style={styles.progressTrack}>
                                    <View style={[styles.progressBar, { backgroundColor: theme.primary, width: `${(currentStep / totalSteps) * 100}%` }]} />
                                    <View style={[styles.progressBarBg, { backgroundColor: theme.border }]} />
                                </View>
                                <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                                    Step {currentStep} of {totalSteps}: {
                                        currentStep === 1 ? 'Basic Info' :
                                            currentStep === 2 ? 'Details & Pricing' :
                                                'Location & Media'
                                    }
                                </Text>
                            </View>

                            {currentStep === 1 && (
                                <View style={styles.stepContainer}>
                                    {/* Type Selection */}
                                    <View style={styles.section}>
                                        <InputLabel label="Property Type" />
                                        <View style={[styles.toggleContainer, { backgroundColor: theme.inputBackground }]}>
                                            <TouchableOpacity
                                                style={[styles.toggleBtn, type === 'Rent' && [styles.toggleBtnActive, { backgroundColor: theme.card }]]}
                                                onPress={() => setType('Rent')}
                                            >
                                                <Text style={[styles.toggleText, { color: theme.textSecondary }, type === 'Rent' && [styles.toggleTextActive, { color: theme.primary }]]}>Rent</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.toggleBtn, type === 'Sale' && [styles.toggleBtnActive, { backgroundColor: theme.card }]]}
                                                onPress={() => setType('Sale')}
                                            >
                                                <Text style={[styles.toggleText, { color: theme.textSecondary }, type === 'Sale' && [styles.toggleTextActive, { color: theme.primary }]]}>Sale</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Basic Info */}
                                    <View style={styles.section}>
                                        <InputLabel label="Listing Title" />
                                        <TextInput
                                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                            placeholder="e.g. Modern Villa in Hodan"
                                            placeholderTextColor={theme.textSecondary}
                                            value={title}
                                            onChangeText={setTitle}
                                        />
                                    </View>

                                    <View style={styles.section}>
                                        <InputLabel label="Detailed Description" />
                                        <TextInput
                                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text, height: 150, textAlignVertical: 'top' }]}
                                            placeholder="Describe your property (features, amenities, nearby places)..."
                                            placeholderTextColor={theme.textSecondary}
                                            multiline
                                            value={description}
                                            onChangeText={setDescription}
                                        />
                                    </View>
                                </View>
                            )}

                            {currentStep === 2 && (
                                <View style={styles.stepContainer}>
                                    <View style={styles.row}>
                                        <View style={[styles.section, { flex: 1 }]}>
                                            <InputLabel label={`Price(${type === 'Rent' ? 'Monthly' : 'Total'})`} />
                                            <View style={[styles.inputContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
                                                <Text style={[styles.currencyPrefix, { color: theme.textSecondary }]}>$</Text>
                                                <TextInput
                                                    style={[styles.innerInput, { color: theme.text }]}
                                                    placeholder={type === 'Rent' ? "500" : "80,000"}
                                                    placeholderTextColor={theme.textSecondary}
                                                    keyboardType="numeric"
                                                    value={price}
                                                    onChangeText={setPrice}
                                                />
                                            </View>
                                        </View>
                                        <View style={{ width: 16 }} />
                                        <View style={[styles.section, { flex: 1 }]}>
                                            <InputLabel label="Area (sqm)" />
                                            <TextInput
                                                style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                                placeholder="120"
                                                placeholderTextColor={theme.textSecondary}
                                                keyboardType="numeric"
                                                value={area}
                                                onChangeText={setArea}
                                            />
                                        </View>
                                    </View>

                                    <View style={styles.row}>
                                        <View style={[styles.section, { flex: 1 }]}>
                                            <InputLabel label="Bedrooms" />
                                            <TextInput
                                                style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                                placeholder="3"
                                                placeholderTextColor={theme.textSecondary}
                                                keyboardType="numeric"
                                                value={bedrooms}
                                                onChangeText={setBedrooms}
                                            />
                                        </View>
                                        <View style={{ width: 16 }} />
                                        <View style={[styles.section, { flex: 1 }]}>
                                            <InputLabel label="Bathrooms" />
                                            <TextInput
                                                style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                                placeholder="2"
                                                placeholderTextColor={theme.textSecondary}
                                                keyboardType="numeric"
                                                value={bathrooms}
                                                onChangeText={setBathrooms}
                                            />
                                        </View>
                                    </View>

                                    {/* Amenities Selection */}
                                    <View style={styles.section}>
                                        <InputLabel label="Amenities" />
                                        <View style={styles.amenityGrid}>
                                            {AMENITIES.map((amenity) => {
                                                const isSelected = selectedAmenities.includes(amenity.id);
                                                return (
                                                    <TouchableOpacity
                                                        key={amenity.id}
                                                        style={[
                                                            styles.amenityItem,
                                                            { borderColor: theme.border, backgroundColor: theme.card },
                                                            isSelected && { borderColor: theme.primary, backgroundColor: theme.primaryLight }
                                                        ]}
                                                        onPress={() => {
                                                            if (isSelected) {
                                                                setSelectedAmenities(prev => prev.filter(a => a !== amenity.id));
                                                            } else {
                                                                setSelectedAmenities(prev => [...prev, amenity.id]);
                                                            }
                                                        }}
                                                    >
                                                        <Ionicons
                                                            name={amenity.icon as any}
                                                            size={20}
                                                            color={isSelected ? theme.primary : theme.textSecondary}
                                                        />
                                                        <Text style={[
                                                            styles.amenityText,
                                                            { color: isSelected ? theme.primary : theme.textSecondary }
                                                        ]}>
                                                            {amenity.label}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                </View>
                            )}

                            {currentStep === 3 && (
                                <View style={styles.stepContainer}>
                                    {/* Location Map */}
                                    <View style={styles.section}>
                                        <InputLabel label="Location" />
                                        <View style={styles.mapContainer}>
                                            <MapView
                                                style={styles.map}
                                                provider={PROVIDER_DEFAULT}
                                                region={{
                                                    latitude: location.latitude,
                                                    longitude: location.longitude,
                                                    latitudeDelta: location.latitudeDelta,
                                                    longitudeDelta: location.longitudeDelta,
                                                }}
                                                onRegionChangeComplete={(region) => setLocation(prev => ({ ...prev, ...region }))}
                                            >
                                                <Marker
                                                    coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                                                    draggable
                                                    onDragEnd={(e) => setLocation(prev => ({ ...prev, ...e.nativeEvent.coordinate }))}
                                                />
                                            </MapView>
                                            <View style={styles.mapOverlay}>
                                                <Text style={styles.mapOverlayText}>Drag marker to set exact location</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.row, { marginTop: 12 }]}>
                                            <TextInput
                                                style={[styles.input, { flex: 1, backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                                placeholder="City (e.g. Mogadishu)"
                                                placeholderTextColor={theme.textSecondary}
                                                value={city}
                                                onChangeText={setCity}
                                            />
                                            <View style={{ width: 12 }} />
                                            <TextInput
                                                style={[styles.input, { flex: 1, backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                                placeholder="District (e.g. Hodan)"
                                                placeholderTextColor={theme.textSecondary}
                                                value={district}
                                                onChangeText={setDistrict}
                                            />
                                        </View>
                                    </View>

                                    {/* Images */}
                                    <View style={styles.section}>
                                        <View style={styles.labelRow}>
                                            <InputLabel label="Property Photos" />
                                            <Text style={[styles.countText, { color: theme.primary }]}>{images.length}/10</Text>
                                        </View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                                            <TouchableOpacity
                                                style={[styles.addPhotoBtn, { borderColor: theme.primary, backgroundColor: theme.primaryLight }]}
                                                onPress={handlePickImage}
                                            >
                                                <Ionicons name="images-outline" size={28} color={theme.primary} />
                                                <Text style={[styles.addPhotoText, { color: theme.primary }]}>Add Photos</Text>
                                            </TouchableOpacity>

                                            {images.map((img, index) => (
                                                <View key={index} style={styles.imageWrapper}>
                                                    <Image source={{ uri: img }} style={styles.uploadedImage} />
                                                    <TouchableOpacity
                                                        style={[styles.removeBtn, { backgroundColor: theme.error }]}
                                                        onPress={() => setImages(images.filter((_, i) => i !== index))}
                                                    >
                                                        <Ionicons name="close" size={14} color="#FFF" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </ScrollView>
                                        <Text style={[styles.helperText, { color: theme.textSecondary }]}>
                                            Tip: Provide high-quality images to attract more tenants. First image will be the cover.
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, {
                borderTopColor: theme.border,
                paddingBottom: insets.bottom + 24,
                paddingTop: 16,
                flexDirection: 'row',
                gap: 12
            }]}>
                {currentStep > 1 && (
                    <TouchableOpacity
                        style={[styles.backStepBtn, { borderColor: theme.border }]}
                        onPress={handleBack}
                    >
                        <Ionicons name="chevron-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                )}
                <Button
                    title={currentStep === totalSteps ? (isEdit ? "Cusboonaysii" : "Soo dheji") : "Sii wad"}
                    onPress={currentStep === totalSteps ? handleSubmit : handleNext}
                    size="lg"
                    isLoading={uploading || createProperty.isPending}
                    style={{ flex: 1, shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    draftText: {
        fontSize: 14,
        fontWeight: '700',
    },
    content: {
        padding: 24,
    },
    progressContainer: {
        marginBottom: 32,
    },
    progressBarBg: {
        height: 4,
        borderRadius: 2,
        width: '100%',
        position: 'absolute',
        top: 0,
        zIndex: -1,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 8,
    },
    section: {
        marginBottom: 24,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    countText: {
        fontSize: 12,
        fontWeight: '700',
    },
    input: {
        borderWidth: 1.5,
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    currencyPrefix: {
        fontSize: 16,
        fontWeight: '700',
        marginRight: 8,
    },
    innerInput: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        fontWeight: '500',
    },
    toggleContainer: {
        flexDirection: 'row',
        borderRadius: 16,
        padding: 6,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    toggleBtnActive: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleText: {
        fontSize: 15,
        fontWeight: '600',
    },
    toggleTextActive: {
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
    },
    imageScroll: {
        flexDirection: 'row',
    },
    addPhotoBtn: {
        width: 100,
        height: 120,
        borderRadius: 20,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    addPhotoText: {
        fontSize: 11,
        fontWeight: '700',
        marginTop: 8,
    },
    imageWrapper: {
        width: 100,
        height: 120,
        marginRight: 12,
        position: 'relative',
    },
    uploadedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    removeBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    progressTrack: {
        height: 4,
        width: '100%',
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
    },
    stepContainer: {
        flex: 1,
    },
    backStepBtn: {
        width: 56,
        height: 56,
        borderRadius: 16,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
    },
    mapContainer: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        position: 'relative',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 8,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    mapOverlayText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    helperText: {
        fontSize: 12,
        marginTop: 12,
        fontStyle: 'italic',
    },
    amenityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    amenityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 14,
        borderWidth: 1.5,
        gap: 8,
    },
    amenityText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
