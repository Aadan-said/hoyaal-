import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/hooks/useAuth';
import { useCreateProperty } from '@/hooks/useProperties';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PostPropertyScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const { user } = useAuthStore();
    const { canPostProperty } = useAuth();
    const createProperty = useCreateProperty();

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

    const [type, setType] = useState<'Rent' | 'Sale'>('Rent');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [area, setArea] = useState('');
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [images, setImages] = useState<string[]>([]);

    const handlePickImage = () => {
        setImages([...images, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop']);
    };

    const handleSubmit = async () => {
        if (!title || !price || !city) {
            Alert.alert('Missing Info', 'Please fill in the title, price, and city.');
            return;
        }

        try {
            await createProperty.mutateAsync({
                title,
                description,
                price: parseFloat(price),
                currency: 'USD',
                type,
                location: { city, district },
                area,
                image: images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073&auto=format&fit=crop',
                bedrooms: 0,
                bathrooms: 0,
                verification: 'unverified',
                owner: {
                    name: user?.name || '',
                    phone: user?.phone || '',
                    rating: 5.0
                }
            });

            Alert.alert('Success', 'Your property listing has been submitted for verification.');
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to publish listing. Please try again.');
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
                <Text style={[styles.headerTitle, { color: theme.text }]}>Post Listing</Text>
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
                    {/* Progress Indicator (Mock) */}
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { backgroundColor: theme.primary, width: '40%' }]} />
                        <View style={[styles.progressBarBg, { backgroundColor: theme.border }]} />
                        <Text style={[styles.progressText, { color: theme.textSecondary }]}>Step 1 of 3: Basic Info</Text>
                    </View>

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
                            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text, height: 120, textAlignVertical: 'top' }]}
                            placeholder="Describe your property (features, amenities, nearby places)..."
                            placeholderTextColor={theme.textSecondary}
                            multiline
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.section, { flex: 1 }]}>
                            <InputLabel label={`Price (${type === 'Rent' ? 'Monthly' : 'Total'})`} />
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

                    {/* Location */}
                    <View style={styles.section}>
                        <InputLabel label="Location" />
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, { flex: 1, backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                placeholder="City"
                                placeholderTextColor={theme.textSecondary}
                                value={city}
                                onChangeText={setCity}
                            />
                            <View style={{ width: 16 }} />
                            <TextInput
                                style={[styles.input, { flex: 1, backgroundColor: theme.inputBackground, borderColor: theme.border, color: theme.text }]}
                                placeholder="District"
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
                                <Ionicons name="add-circle-outline" size={28} color={theme.primary} />
                                <Text style={[styles.addPhotoText, { color: theme.primary }]}>Add Image</Text>
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
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, {
                borderTopColor: theme.border,
                paddingBottom: insets.bottom + 24, // Respect system bars
                paddingTop: 16
            }]}>
                <Button
                    title="Publish Listing"
                    onPress={handleSubmit}
                    size="lg"
                    isLoading={createProperty.isPending}
                    style={{ shadowColor: theme.primary, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }}
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
    footer: {
        padding: 24,
        borderTopWidth: 1,
    },
});
