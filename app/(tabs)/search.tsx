import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const insets = useSafeAreaInsets();
    const [type, setType] = useState<'Rent' | 'Sale'>('Rent');
    const [bedrooms, setBedrooms] = useState(2);
    const [city, setCity] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Search Properties</Text>
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
                        <Text style={[styles.label, { color: theme.text }]}>Bedrooms</Text>
                        <View style={styles.bedroomContainer}>
                            {[1, 2, 3, 4, '5+'].map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={[
                                        styles.bedroomBtn,
                                        { borderColor: theme.border, backgroundColor: theme.card },
                                        bedrooms === (typeof num === 'string' ? 5 : num) && { backgroundColor: theme.primary, borderColor: theme.primary }
                                    ]}
                                    onPress={() => setBedrooms(typeof num === 'string' ? 5 : num as number)}
                                >
                                    <Text style={[
                                        styles.bedroomText,
                                        { color: theme.text },
                                        bedrooms === (typeof num === 'string' ? 5 : num) && { color: '#FFF', fontWeight: 'bold' }
                                    ]}>{num}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Sticky Footer - Now accounts for Tab Bar Height and System Insets */}
            <View style={[styles.footer, {
                borderTopColor: theme.border,
                backgroundColor: theme.background,
                paddingBottom: insets.bottom + 85, // 85 is Tab bar offset
                paddingTop: 16
            }]}>
                <Button
                    title={`Search ${type === 'Rent' ? 'Rentals' : 'Properties'}`}
                    onPress={() => { }}
                    size="lg"
                    icon="search"
                    style={{
                        shadowColor: theme.primary,
                        shadowOpacity: 0.4,
                        shadowRadius: 15,
                        elevation: 10,
                        height: 58
                    }}
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
});
