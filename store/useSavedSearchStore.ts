import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface SavedSearch {
    id: string;
    title: string;
    filters: {
        city?: string;
        type?: 'Rent' | 'Sale';
        minPrice?: number;
        maxPrice?: number;
        bedrooms?: number;
    };
    createdAt: string;
}

interface SavedSearchState {
    searches: SavedSearch[];
    saveSearch: (search: Omit<SavedSearch, 'id' | 'createdAt'>) => void;
    removeSearch: (id: string) => void;
}

export const useSavedSearchStore = create<SavedSearchState>()(
    persist(
        (set) => ({
            searches: [],
            saveSearch: (newSearch) => set((state) => ({
                searches: [
                    {
                        ...newSearch,
                        id: Math.random().toString(36).substr(2, 9),
                        createdAt: new Date().toISOString()
                    },
                    ...state.searches
                ]
            })),
            removeSearch: (id) => set((state) => ({
                searches: state.searches.filter((s) => s.id !== id)
            })),
        }),
        {
            name: 'hoyaal-saved-searches',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
