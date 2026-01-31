import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const role = user?.role || 'SEEKER'; // Default to SEEKER if not logged in

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.background,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          display: 'none',
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>

      {/* HOME - Visible to All */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={26} color={color} />
              {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      {/* SEARCH - Visible to SEEKER and OWNER */}
      {(role === 'SEEKER' || role === 'OWNER') && (
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons name={focused ? 'search' : 'search-outline'} size={26} color={color} />
                {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
      )}

      {/* FAVORITES - Seeker only */}
      {role === 'SEEKER' && (
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons name={focused ? 'heart' : 'heart-outline'} size={26} color={color} />
                {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
      )}

      {/* POST/MY LISTINGS - Owners & Agents */}
      {(role === 'OWNER' || role === 'AGENT' || role === 'ADMIN') && (
        <Tabs.Screen
          name="management"
          options={{
            title: 'My Properties',
            tabBarIcon: ({ color, focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={28} color={color} />
                {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
      )}



      {/* MESSAGES - Visible to All */}
      {/* Note: In a real app, you might have index.tsx for messages tab */}
      <Tabs.Screen
        name="messages"
        options={{
          href: '/(tabs)/messages', // Placeholder for upcoming screen
          title: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={26} color={color} />
              {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />

      {/* PROFILE - Visible to All */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={26} color={color} />
              {focused && <View style={[styles.activeDot, { backgroundColor: color }]} />}
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    width: 48,
  },
  activeIconContainer: {
    // Optional scaling
    // transform: [{ scale: 1.1 }]
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 6,
  }
});
