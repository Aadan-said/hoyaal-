import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProperties } from '@/hooks/useProperties';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES = [
  { name: 'All', icon: 'grid-outline' },
  { name: 'House', icon: 'home-outline' },
  { name: 'Apartment', icon: 'business-outline' },
  { name: 'Villa', icon: 'shield-checkmark-outline' },
  { name: 'Land', icon: 'map-outline' },
  { name: 'Office', icon: 'briefcase-outline' }
];

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { user } = useAuthStore();
  const { data: properties, isLoading, isError, refetch } = useProperties();

  const [activeTab, setActiveTab] = useState<'Rent' | 'Sale'>('Rent');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredProperties = properties?.filter(p => {
    const matchTab = p.type === activeTab;
    const matchCategory = activeCategory === 'All' || p.title.toLowerCase().includes(activeCategory.toLowerCase()) || p.description?.toLowerCase().includes(activeCategory.toLowerCase());
    return matchTab && matchCategory;
  }) || [];


  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            {user ? `Fikir Wacan, ${user.name.split(' ')[0]}` : 'Current Location'}
          </Text>
          <TouchableOpacity style={styles.locationSelector}>
            <Ionicons name="location" size={20} color={theme.primary} />
            <Text style={[styles.locationText, { color: theme.text }]}>Mogadishu, Somalia</Text>
            <Ionicons name="chevron-down" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.profileBtn, { borderColor: theme.border }]}>
          <View style={[styles.profileImage, { backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{user?.name.charAt(0)}</Text>
          </View>
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TouchableOpacity style={[styles.searchContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
        <Ionicons name="search" size={22} color={theme.textSecondary} />
        <Text style={[styles.searchPlaceholder, { color: theme.textSecondary }]}>Search properties, areas...</Text>
        <View style={[styles.filterBtn, { backgroundColor: theme.primary }]}>
          <Ionicons name="options-outline" size={20} color="#FFF" />
        </View>
      </TouchableOpacity>

      {/* Buy/Rent Toggle */}
      <View style={[styles.toggleContainer, { backgroundColor: theme.inputBackground }]}>
        <TouchableOpacity
          style={[styles.toggleBtn, activeTab === 'Rent' && [styles.activeToggleBtn, { backgroundColor: theme.card }]]}
          onPress={() => setActiveTab('Rent')}
        >
          <Text style={[
            styles.toggleText,
            { color: theme.textSecondary },
            activeTab === 'Rent' && { color: theme.primary, fontWeight: '700' }
          ]}>Rent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, activeTab === 'Sale' && [styles.activeToggleBtn, { backgroundColor: theme.card }]]}
          onPress={() => setActiveTab('Sale')}
        >
          <Text style={[
            styles.toggleText,
            { color: theme.textSecondary },
            activeTab === 'Sale' && { color: theme.primary, fontWeight: '700' }
          ]}>Buy</Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContent}
        style={styles.categoriesScroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.name}
            style={[
              styles.categoryChip,
              { backgroundColor: theme.card, borderColor: theme.border },
              activeCategory === cat.name && { backgroundColor: theme.primary, borderColor: theme.primary }
            ]}
            onPress={() => setActiveCategory(cat.name)}
          >
            <Ionicons
              name={cat.icon as any}
              size={18}
              color={activeCategory === cat.name ? '#FFF' : theme.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text style={[
              styles.categoryText,
              { color: theme.textSecondary },
              activeCategory === cat.name && { color: '#FFF' }
            ]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Featured {activeCategory !== 'All' ? activeCategory : 'Properties'}
        </Text>
        <TouchableOpacity>
          <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <ErrorMessage
          message="Waa xalad ah inay xogta la soo gaaro. Fadlan isku day mar kale."
          onRetry={() => refetch()}
          retryText="Mar kale isku day"
        />
      ) : (
        <FlatList
          data={filteredProperties}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PropertyCard property={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="home-outline" size={64} color={theme.border} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No properties found.</Text>
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
  headerContainer: {
    marginBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '500',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  searchContainer: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    borderWidth: 1,
    marginBottom: 24,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 15,
    marginLeft: 12,
  },
  filterBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 16,
    marginBottom: 24,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12, // Taller touch target
    alignItems: 'center',
    borderRadius: 12,
  },
  activeToggleBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  categoriesScroll: {
    marginBottom: 24,
  },
  categoriesContent: {
    gap: 12,
    paddingRight: 24, // Initial padding handled by container? No, FlatList header logic
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 0, // Using gap instead
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800', // Premium feel
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 8,
  },
  errorSub: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
  }
});
