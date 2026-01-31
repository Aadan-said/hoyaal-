import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type Language = 'en' | 'so';

interface Translations {
    [key: string]: {
        en: string;
        so: string;
    };
}

export const translations: Translations = {
    // Auth
    welcome_title: { en: 'Find Your Perfect Home', so: 'Raadso Hoygaaga Riyada' },
    welcome_sub: { en: 'Real estate simplified for the Somali community.', so: 'Guryaha oo loo fududeeyay bulshada Soomaaliyeed.' },
    login: { en: 'Login', so: 'Soo gal' },
    register: { en: 'Register', so: 'Isku diwaangeli' },

    // Tabs
    home: { en: 'Home', so: 'Hoyga' },
    search: { en: 'Search', so: 'Raadi' },
    favorites: { en: 'Favorites', so: 'Kaydka' },
    messages: { en: 'Messages', so: 'Fariimaha' },
    profile: { en: 'Profile', so: 'Profile-ka' },
    management: { en: 'My Properties', so: 'Guryahayga' },

    // Home
    search_placeholder: { en: 'Where do you want to live?', so: 'Halkee ayaad rabaa inaad degto?' },
    categories: { en: 'Categories', so: 'Noocyada' },
    featured: { en: 'Featured Properties', so: 'Guryaha ugu caansan' },
    view_all: { en: 'View All', so: 'Eeg Dhammaan' },

    // Search
    location: { en: 'Location', so: 'Goobta' },
    property_type: { en: 'Property Type', so: 'Nooca Guriga' },
    price_range: { en: 'Price Range', so: 'Inta u dhaxaysa' },
    min_bedrooms: { en: 'Min Bedrooms', so: 'Qolalka' },
    show_results: { en: 'Show Results', so: 'Muuji Natiijada' },

    // Profile
    edit_profile: { en: 'Edit Profile', so: 'Wax ka badal Profile' },
    language: { en: 'Language', so: 'Afka' },
    logout: { en: 'Log Out', so: 'Ka bax' },
    listings: { en: 'Listings', so: 'Guryaha' },
    rating: { en: 'Rating', so: 'Qiimaynta' },
    reviews: { en: 'Reviews', so: 'Aragtida' },
    notifications: { en: 'Notifications', so: 'Ogeysiisyada' },
    views: { en: 'Views', so: 'Eegis' },
    submit_review: { en: 'Submit Review', so: 'Gudbi Qiimaynta' },

};

interface I18nState {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

export const useI18n = create<I18nState>()(
    persist(
        (set, get) => ({
            language: 'en',
            setLanguage: (lang) => set({ language: lang }),
            t: (key) => {
                const lang = get().language;
                return translations[key]?.[lang] || key;
            },
        }),
        {
            name: 'hoyaal-i18n',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
