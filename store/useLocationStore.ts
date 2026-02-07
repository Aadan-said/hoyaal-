import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { create } from 'zustand';

interface LocationState {
    location: Location.LocationObject | null;
    address: Location.LocationGeocodedAddress | null;
    errorMsg: string | null;
    isLoading: boolean;
    requestLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
    location: null,
    address: null,
    errorMsg: null,
    isLoading: false,
    requestLocation: async () => {
        set({ isLoading: true, errorMsg: null });
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                set({ errorMsg: 'Permission to access location was denied', isLoading: false });
                Alert.alert('Permission needed', 'Please enable location services to find properties near you.');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            set({ location });

            // Reverse Geolocate
            try {
                let addresses = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });

                if (addresses && addresses.length > 0) {
                    set({ address: addresses[0] });
                }
            } catch (e) {
                console.log("Reverse geocoding failed", e);
            }

        } catch (error) {
            set({ errorMsg: 'Error fetching location', location: null });
        } finally {
            set({ isLoading: false });
        }
    },
}));
