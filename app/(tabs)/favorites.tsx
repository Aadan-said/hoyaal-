import { PropertyCard } from '@/components/PropertyCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Property } from '@/types/property';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock Data for favorites
const FAVORITE_PROPERTIES: Property[] = [
    {
        id: '1',
        title: 'Villa Hodan Luxury Estate',
        price: 1200,
        currency: 'USD',
        type: 'Rent',
        location: { city: 'Mogadishu', district: 'Hodan' },
        bedrooms: 5,
        bathrooms: 4,
        area: 450,
        image: 'https://images.unsplash.com/photo-1613977257377-67554027095f?q=80&w=2070&auto=format&fit=crop',
        verification: 'verified',
        rating: 4.8,
        owner: {
            name: 'Ahmed Hassan',
            phone: '+252612345678',
            rating: 4.8
        }
    },
    {
        id: '2',
        title: 'Modern Seaside Apartment',
        price: 85000,
        currency: 'USD',
        type: 'Sale',
        location: { city: 'Mogadishu', district: 'Waberi' },
        bedrooms: 2,
        bathrooms: 2,
        area: 120,
        image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2070&auto=format&fit=crop',
        verification: 'agent',
        rating: 4.5,
        owner: {
            name: 'Fatima Mohamed',
            phone: '+252619876543',
            rating: 4.5
        }
    },
];

export default function FavoritesScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Saved Properties</Text>
            </View>

            <FlatList
                data={FAVORITE_PROPERTIES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <PropertyCard property={item} />}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIconContainer, { backgroundColor: theme.inputBackground }]}>
                            <Ionicons name="heart-outline" size={64} color={theme.textSecondary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Favorites Yet</Text>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                            Start exploring and save your dream properties here.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 24,
        paddingVertical: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
    emptyContainer: {
        marginTop: 80,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    }
});
