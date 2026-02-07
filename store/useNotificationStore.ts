import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { create } from 'zustand';

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

interface NotificationState {
    expoPushToken: string | undefined;
    permissionStatus: any | 'undetermined';
    registerForPushNotificationsAsync: () => Promise<string | undefined>;
}

// Handler to show notifications when app is in foreground
if (Notifications) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export const useNotificationStore = create<NotificationState>((set) => ({
    expoPushToken: undefined,
    permissionStatus: 'undetermined',

    registerForPushNotificationsAsync: async () => {
        if (!Notifications) {
            console.log('Push notifications are not supported in Expo Go on Android SDK 53+');
            return undefined;
        }

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (!Device.isDevice) {
            console.log('Must use physical device for Push Notifications');
            return;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        set({ permissionStatus: finalStatus });

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }

        // Get the token
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ??
            Constants.easConfig?.projectId ??
            '745d27bc-b930-4767-932f-488b8a53697e';

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId
        });
        const token = tokenData.data;

        set({ expoPushToken: token });
        return token;
    },
}));
