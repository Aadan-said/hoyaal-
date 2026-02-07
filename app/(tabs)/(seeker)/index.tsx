import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNotifications } from '@/hooks/useNotifications';
import { useProperties } from '@/hooks/useProperties';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocationStore } from '@/store/useLocationStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
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
  const { location, address, requestLocation, isLoading: isLocationLoading, errorMsg } = useLocationStore();
  const router = useRouter();
  const role = user?.role || 'SEEKER';

  useEffect(() => {
    requestLocation();
  }, []);
  const { data: properties, isLoading, isError, refetch } = useProperties();
  const { data: notifications } = useNotifications(user?.id || '');
  const unreadNotifications = notifications?.filter(n => !n.is_read).length || 0;

  const [activeTab, setActiveTab] = useState<'Rent' | 'Sale'>('Rent');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProperties = properties?.filter(p => {
    const matchTab = p.type === activeTab;
    const matchCategory = activeCategory === 'All' || p.title.toLowerCase().includes(activeCategory.toLowerCase()) || p.description?.toLowerCase().includes(activeCategory.toLowerCase());
    const matchSearch = !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.district.toLowerCase().includes(searchQuery.toLowerCase());

    // For Seekers, only show verified/agent properties (or based on app requirement)
    // For now, let's keep it simple but functional
    return matchTab && matchCategory && matchSearch;
  }) || [];


  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={[theme.primaryLight, 'transparent']}
        style={styles.headerGradient}
      />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.userSection}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            {user ? 'Kusoo dhawaow,' : 'Current Location'}
          </Text>
          <View style={styles.userInfoRow}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user ? user.name : (address?.city || 'Somalia')}
            </Text>
            <TouchableOpacity style={styles.locationBadge} onPress={requestLocation}>
              <Ionicons name="location" size={14} color={theme.primary} />
              <Text style={[styles.locationBadgeText, { color: theme.primary }]}>
                {address ? `${address.district || address.city}` : isLocationLoading ? 'Locating...' : 'Muqdisho'}
              </Text>
              <Ionicons name="chevron-down" size={12} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.profileBtn, { borderColor: theme.border, backgroundColor: theme.card, marginRight: 12 }]}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.text} />
            {unreadNotifications > 0 && (
              <View style={[styles.notificationBadge, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.badgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.profileBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
            onPress={() => router.push('/(tabs)/(shared)/messages')}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {role !== 'OWNER' && (
        <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
          <Ionicons name="search" size={22} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Raadi guryo, degmooyin..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={[styles.filterBtn, { backgroundColor: theme.primary }]}>
            <Ionicons name="options-outline" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

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

      {/* Map Widget */}
      <View style={styles.mapWidgetContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text, fontSize: 18 }]}>Near You</Text>
        </View>
        <TouchableOpacity
          style={styles.mapPreview}
          onPress={() => router.push('/(tabs)/(seeker)/search')}
        >
          <MapView
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_DEFAULT}
            scrollEnabled={false}
            zoomEnabled={false}
            region={{
              latitude: location?.coords.latitude || 2.0469,
              longitude: location?.coords.longitude || 45.3182,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {filteredProperties.slice(0, 3).map(p => (p.latitude && p.longitude) ? (
              <Marker
                key={p.id}
                coordinate={{ latitude: p.latitude, longitude: p.longitude }}
              />
            ) : null)}
            {location && (
              <Marker
                coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
                pinColor="blue"
              />
            )}
          </MapView>
          <View style={styles.mapOverlay}>
            <Text style={styles.mapOverlayText}>View on Map</Text>
          </View>
        </TouchableOpacity>
      </View>

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
    paddingTop: 8,
  },
  headerGradient: {
    position: 'absolute',
    top: -100,
    left: -24,
    right: -24,
    height: 300,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  locationBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  profileLetterBg: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileLetter: {
    fontSize: 20,
    fontWeight: '800',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
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
  searchInput: {
    flex: 1,
    fontSize: 15,
    marginLeft: 12,
    fontWeight: '500',
    height: '100%',
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
  },
  mapWidgetContainer: {
    marginBottom: 24,
  },
  mapPreview: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 8,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mapOverlayText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  }
});
