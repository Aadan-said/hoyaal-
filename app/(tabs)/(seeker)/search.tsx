import { Button } from '@/components/ui/Button';
import MapView, { Marker } from '@/components/ui/UniversalMapView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { PropertyCard } from '@/components/ui/PropertyCard';
import { useProperties } from '@/hooks/useProperties';
import { useLocationStore } from '@/store/useLocationStore';
import { useSavedSearchStore } from '@/store/useSavedSearchStore';

export default function SearchScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const insets = useSafeAreaInsets();

    const [type, setType] = useState<'Rent' | 'Sale'>('Rent');
    const [bedrooms, setBedrooms] = useState(0);
    const [bathrooms, setBathrooms] = useState(0);
    const [city, setCity] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high' | 'most_viewed'>('newest');
    const [showResults, setShowResults] = useState(false);
    const [isMapView, setIsMapView] = useState(false);
    const router = useRouter();



    const { data: properties, isLoading } = useProperties();

    const filteredProperties = properties?.filter(p => {
        const matchType = p.type === type;
        const matchCity = !city ||
            p.location.city.toLowerCase().includes(city.toLowerCase()) ||
            p.location.district.toLowerCase().includes(city.toLowerCase());
        const matchMinPrice = !minPrice || p.price >= parseFloat(minPrice);
        const matchMaxPrice = !maxPrice || p.price <= parseFloat(maxPrice);
        const matchBedrooms = bedrooms === 0 || p.bedrooms >= bedrooms;
        const matchBathrooms = bathrooms === 0 || p.bathrooms >= bathrooms;

        return matchType && matchCity && matchMinPrice && matchMaxPrice && matchBedrooms && matchBathrooms;
    }).sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'most_viewed') return (b.views || 0) - (a.views || 0);
        // newest is default
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }) || [];

    const resetFilters = () => {
        setCity('');
        setMinPrice('');
        setMaxPrice('');
        setBedrooms(0);
        setBathrooms(0);
        setSortBy('newest');
        setShowResults(false);
        setIsMapView(false);
    };


    const { location } = useLocationStore();

    // ... inside component

    const { saveSearch } = useSavedSearchStore();

    const handleSaveSearch = () => {
        saveSearch({
            title: `${type} in ${city || 'All Cities'}`,
            filters: {
                city,
                type,
                minPrice: parseFloat(minPrice) || 0,
                maxPrice: parseFloat(maxPrice) || 0,
                bedrooms: bedrooms as number
            }
        });
        Alert.alert('Success', 'Search saved! We will notify you when new properties match.');
    };

    if (showResults) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
                <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => setShowResults(false)} style={styles.backBtn}>
                            <Ionicons name="chevron-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>Results ({filteredProperties.length})</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                        <TouchableOpacity onPress={handleSaveSearch}>
                            <Ionicons name="bookmark-outline" size={24} color={theme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsMapView(!isMapView)}>
                            <Ionicons name={isMapView ? "list" : "map"} size={24} color={theme.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={resetFilters}>
                            <Text style={{ color: theme.primary, fontWeight: '600' }}>Reset</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {isMapView ? (
                    <View style={{ flex: 1 }}>
                        <MapView
                            style={StyleSheet.absoluteFillObject}
                            region={{
                                latitude: location?.coords.latitude || 2.0469,
                                longitude: location?.coords.longitude || 45.3182,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                        >
                            {filteredProperties.map(p => p.latitude && p.longitude && (
                                <Marker
                                    key={p.id}
                                    coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                                    title={p.title}
                                    description={`$${p.price}`}
                                    onCalloutPress={() => router.push(`/listing/${p.id}`)}
                                />
                            ))}
                            {location && (
                                <Marker
                                    coordinate={{
                                        latitude: location.coords.latitude,
                                        longitude: location.coords.longitude
                                    }}
                                    pinColor="blue"
                                    title="You are here"
                                />
                            )}
                        </MapView>
                        <TouchableOpacity
                            style={{
                                position: 'absolute',
                                bottom: 20,
                                right: 20,
                                backgroundColor: theme.card,
                                padding: 12,
                                borderRadius: 30,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                                elevation: 5,
                            }}
                        >
                            <Ionicons name="locate" size={24} color={theme.primary} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={filteredProperties}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <PropertyCard property={item} />}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Ionicons name="search-outline" size={64} color={theme.textSecondary} />
                                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No properties match your filters</Text>
                                <Button title="Adjust Filters" onPress={() => setShowResults(false)} style={{ marginTop: 16 }} />
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <LinearGradient
                colors={[theme.primaryLight, 'transparent']}
                style={styles.headerGradient}
            />
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Raadi Guryo</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={[styles.content, { paddingBottom: 150 + insets.bottom }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Location Section */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.text }]}>Location</Text>
                        <View style={[styles.searchBox, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
                            <Ionicons name="search-outline" size={20} color={theme.textSecondary} />
                            <TextInput
                                placeholder="Search City or District"
                                placeholderTextColor={theme.textSecondary}
                                style={[styles.input, { color: theme.text }]}
                                value={city}
                                onChangeText={setCity}
                            />
                        </View>
                    </View>

                    {/* Type Toggle */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.text }]}>Property Type</Text>
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

                    {/* Price Range */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.text }]}>Price Range ({type === 'Rent' ? 'Monthly' : 'Total'})</Text>
                        <View style={styles.row}>
                            <View style={[styles.priceInputContainer, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
                                <Text style={[styles.currency, { color: theme.textSecondary }]}>$</Text>
                                <TextInput
                                    placeholder="Min"
                                    placeholderTextColor={theme.textSecondary}
                                    keyboardType="numeric"
                                    style={[styles.priceInput, { color: theme.text }]}
                                    value={minPrice}
                                    onChangeText={setMinPrice}
                                />
                            </View>
                            <Text style={[styles.dash, { color: theme.textSecondary }]}>-</Text>
                            <View style={[styles.priceInputContainer, { borderColor: theme.border, backgroundColor: theme.inputBackground }]}>
                                <Text style={[styles.currency, { color: theme.textSecondary }]}>$</Text>
                                <TextInput
                                    placeholder="Max"
                                    placeholderTextColor={theme.textSecondary}
                                    keyboardType="numeric"
                                    style={[styles.priceInput, { color: theme.text }]}
                                    value={maxPrice}
                                    onChangeText={setMaxPrice}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Bedrooms */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.text }]}>Min Bedrooms</Text>
                        <View style={styles.bedroomContainer}>
                            {[0, 1, 2, 3, '4+'].map((num) => {
                                const val = num === '4+' ? 4 : num as number;
                                return (
                                    <TouchableOpacity
                                        key={num}
                                        style={[
                                            styles.bedroomBtn,
                                            { borderColor: theme.border, backgroundColor: theme.card },
                                            bedrooms === val && { backgroundColor: theme.primary, borderColor: theme.primary }
                                        ]}
                                        onPress={() => setBedrooms(val)}
                                    >
                                        <Text style={[
                                            styles.bedroomText,
                                            { color: theme.text },
                                            bedrooms === val && { color: '#FFF', fontWeight: 'bold' }
                                        ]}>{num === 0 ? 'Any' : num}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>
                    {/* Min Bathrooms */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.text }]}>Min Bathrooms</Text>
                        <View style={styles.bedroomContainer}>
                            {[0, 1, 2, 3, '4+'].map((num) => {
                                const val = num === '4+' ? 4 : num as number;
                                return (
                                    <TouchableOpacity
                                        key={num}
                                        style={[
                                            styles.bedroomBtn,
                                            { borderColor: theme.border, backgroundColor: theme.card },
                                            bathrooms === val && { backgroundColor: theme.primary, borderColor: theme.primary }
                                        ]}
                                        onPress={() => setBathrooms(val)}
                                    >
                                        <Text style={[
                                            styles.bedroomText,
                                            { color: theme.text },
                                            bathrooms === val && { color: '#FFF', fontWeight: 'bold' }
                                        ]}>{num === 0 ? 'Any' : num}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>

                    {/* Sort By */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.text }]}>Sort By</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                            {[
                                { label: 'Newest', value: 'newest' },
                                { label: 'Price: Low-High', value: 'price_low' },
                                { label: 'Price: High-Low', value: 'price_high' },
                                { label: 'Most Viewed', value: 'most_viewed' },
                            ].map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={[
                                        styles.tab,
                                        sortBy === item.value ? [styles.activeTab, { borderColor: theme.primary }] : { backgroundColor: theme.inputBackground },
                                        { paddingHorizontal: 20, height: 48, justifyContent: 'center' }
                                    ]}
                                    onPress={() => setSortBy(item.value as any)}
                                >
                                    <Text style={[
                                        styles.tabText,
                                        { color: sortBy === item.value ? theme.primary : theme.textSecondary }
                                    ]}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <View style={[styles.footer, {
                borderTopColor: theme.border,
                backgroundColor: theme.background,
                paddingBottom: insets.bottom + 85,
                paddingTop: 16
            }]}>
                <Button
                    title={`Show ${filteredProperties.length} Results`}
                    onPress={() => setShowResults(true)}
                    size="lg"
                    icon="search"
                    style={{ height: 58 }}
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
        paddingHorizontal: 24,
        paddingVertical: 16,
        alignItems: 'center',
    },
    headerGradient: {
        position: 'absolute',
        top: -100,
        left: -24,
        right: -24,
        height: 300,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    content: {
        padding: 24,
    },
    section: {
        marginBottom: 32,
    },
    label: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    input: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontWeight: '500',
        height: '100%',
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
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    priceInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
    },
    currency: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 4,
    },
    priceInput: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        height: '100%',
    },
    dash: {
        marginHorizontal: 16,
        fontSize: 24,
        fontWeight: '300',
    },
    bedroomContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    bedroomBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bedroomText: {
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        paddingHorizontal: 24,
        borderTopWidth: 1,
    },
    backBtn: {
        padding: 4,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    empty: {
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        textAlign: 'center',
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: '#F1F5F9',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    activeTab: {
        backgroundColor: '#FFF',
        borderWidth: 1.5,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

