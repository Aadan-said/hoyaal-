import { initializeAuth, useAuthStore } from '@/store/useAuthStore';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { registerForPushNotificationsAsync, useUpdatePushToken } from '@/hooks/useNotifications';

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: '(tabs)',
};

import { SafeAreaProvider } from 'react-native-safe-area-context';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const updatePushToken = useUpdatePushToken();

  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      setIsReady(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to welcome if not authenticated
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if already logged in and trying to access auth
      router.replace('/(tabs)/(seeker)');
    }

    // Phase 4: Handle Push Token Registration
    if (isAuthenticated && user?.id) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          updatePushToken.mutate({ userId: user.id, token });
        }
      });
    }
  }, [isAuthenticated, segments, isReady]);

  if (!isReady) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="listing/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="post-property/index" options={{ presentation: 'modal', title: 'Post Property' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootLayoutNav />
    </QueryClientProvider>
  );
}
