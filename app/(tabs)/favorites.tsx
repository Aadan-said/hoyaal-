import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFavorites } from '@/hooks/useFavorites';
import { useProperties } from '@/hooks/useProperties';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FavoritesScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const { favorites, isLoading: isFavLoading } = useFavorites();
    const { data: properties, isLoading: isPropsLoading, refetch } = useProperties();

    const favoriteProperties = properties?.filter(p => favorites.includes(p.id)) || [];
    const isLoading = isFavLoading || isPropsLoading;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Saved Properties</Text>
            </View>

            {isLoading && favoriteProperties.length === 0 ? (
                <LoadingSpinner />
            ) : (
                <FlatList
                    data={favoriteProperties}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <PropertyCard property={item} />}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.primary} />
                    }
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
            )}
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
