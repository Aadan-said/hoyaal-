import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { user } = useAuthStore();
  const role = user?.role || 'SEEKER';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 20,
          right: 20,
          backgroundColor: theme.card,
          borderRadius: 25,
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          height: 100,
          paddingHorizontal: 15,
          paddingBottom: 0, // Removed padding for centered icons without labels
          borderWidth: 1,
          borderColor: theme.border,
        },
      }}>

      {/* HOME - Visible to Both */}
      <Tabs.Screen
        name="(seeker)/index"
        options={{
          href: (role === 'SEEKER' || role === 'OWNER') ? '/(tabs)/(seeker)' : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={32} color={color} />
          ),
        }}
      />

      {/* SEARCH - Seeker Only */}
      <Tabs.Screen
        name="(seeker)/search"
        options={{
          href: role === 'SEEKER' ? '/(tabs)/(seeker)/search' : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={32} color={color} />
          ),
        }}
      />

      {/* FAVORITES - Seeker Only */}
      <Tabs.Screen
        name="(seeker)/favorites"
        options={{
          href: role === 'SEEKER' ? '/(tabs)/(seeker)/favorites' : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={32} color={color} />
          ),
        }}
      />

      {/* POST PROPERTY - Owner Only (Middle Button) */}
      <Tabs.Screen
        name="post"
        options={{
          href: role === 'OWNER' ? '/(tabs)/post' : null,
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              backgroundColor: theme.primary,
              width: 58,
              height: 58,
              borderRadius: 29,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: 8,
              borderWidth: 4,
              borderColor: theme.background,
            }}>
              <Ionicons name="add" size={32} color="#FFF" />
            </View>
          ),
        }}
      />

      {/* MY PROPERTIES - Owner Only */}
      <Tabs.Screen
        name="(owner)/management"
        options={{
          href: role === 'OWNER' ? '/(tabs)/(owner)/management' : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'business' : 'business-outline'} size={32} color={color} />
          ),
        }}
      />

      {/* ADMIN TAB */}
      <Tabs.Screen
        name="(admin)/admin"
        options={{
          href: role === 'ADMIN' ? '/(tabs)/(admin)/admin' : null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} size={32} color={color} />
          ),
        }}
      />

      {/* MESSAGES - HIDDEN from bottom bar */}
      <Tabs.Screen
        name="(shared)/messages"
        options={{
          href: null,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={32} color={color} />
          ),
        }}
      />

      {/* PREMIUM - Visible to All */}
      <Tabs.Screen
        name="(shared)/premium"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'card' : 'card-outline'} size={32} color={color} />
          ),
        }}
      />

      {/* PROFILE - Visible to All */}
      <Tabs.Screen
        name="(shared)/profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={32} color={color} />
          ),
        }}
      />

      {/* HIDDEN SCREENS */}
      <Tabs.Screen
        name="(shared)/edit-profile"
        options={{ href: null }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({});
