import { supabase } from '@/api/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Conditionally load expo-notifications to avoid crash in Expo Go on Android SDK 53+
let Notifications: any = null;
try {
    const isExpoGo = Constants.appOwnership === 'expo';
    if (!(isExpoGo && Platform.OS === 'android')) {
        Notifications = require('expo-notifications');
    }
} catch (e) {
    console.warn('Failed to load expo-notifications:', e);
}

export function useNotifications(userId: string) {
    return useQuery({
        queryKey: ['notifications', userId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
        enabled: !!userId
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });
}

export function useSendNotification() {
    return useMutation({
        mutationFn: async ({ userId, title, message, type }: { userId: string, title: string, message: string, type?: string }) => {
            // 1. Save to DB for in-app notification center
            const { error } = await supabase
                .from('notifications')
                .insert({
                    user_id: userId,
                    title,
                    message,
                    type
                });

            if (error) throw error;

            // 2. Potentially send real Push Notification via Edge Function or External API
            // For now, we simulate this by just saving to DB as we don't have a backend server
        }
    });
}

export function useUpdatePushToken() {
    return useMutation({
        mutationFn: async ({ userId, token }: { userId: string, token: string }) => {
            const { error } = await supabase
                .from('profiles')
                .update({ push_token: token })
                .eq('id', userId);

            if (error) throw error;
        }
    });
}

export async function registerForPushNotificationsAsync() {
    if (!Notifications) {
        console.log('Push notifications are not supported in Expo Go on Android SDK 53+');
        return undefined;
    }

    let token;

    try {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            // Learn more about projectId: 
            // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
            // We can use a default or project-specific ID if available
            const projectId = Constants.expoConfig?.extra?.eas?.projectId ??
                Constants.easConfig?.projectId ??
                '745d27bc-b930-4767-932f-488b8a53697e'; // Fallback or user provided

            if (!projectId) {
                console.warn('No projectId found for push notifications. Notifications may not work in development builds.');
                return;
            }

            token = (await Notifications.getExpoPushTokenAsync({
                projectId,
            })).data;
        } else {
            console.log('Must use physical device for Push Notifications');
        }
    } catch (e) {
        console.warn('Error during push notification registration:', e);
    }

    return token;
}
