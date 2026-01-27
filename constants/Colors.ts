/**
 * Hoyaal Theme Colors
 * A refined, premium palette for a modern real estate experience.
 */

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const Colors = {
    light: {
        primary: '#0056D2', // Deep, trustworthy blue (Premium Real Estate feel)
        primaryLight: '#E6F0FF', // Very light blue for backgrounds/accents
        secondary: '#0F172A', // Slate 900 - High contrast text/headers
        background: '#FAFAFA', // Warm gray/off-white (easier on eyes than pure white)
        card: '#FFFFFF', // Pure white for cards to pop against background
        text: '#1E293B', // Slate 800
        textSecondary: '#64748B', // Slate 500
        border: '#E2E8F0', // Slate 200
        inputBackground: '#F8FAFC', // Slate 50
        tint: tintColorLight,
        tabIconDefault: '#94A3B8', // Slate 400
        tabIconSelected: '#0056D2',
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#3B82F6',
        surface: '#FFFFFF',
        surfaceHighlight: '#F1F5F9', // Slate 100
    },
    dark: {
        primary: '#3B82F6', // Brighter blue for dark mode legibility
        primaryLight: '#1E40AF', // Darker blue background
        secondary: '#F8FAFC', // Slate 50 - High contrast text
        background: '#0B1121', // Deep, rich night blue/black (not pure black)
        card: '#151F32', // Slightly lighter blue-gray
        text: '#F1F5F9', // Slate 100
        textSecondary: '#94A3B8', // Slate 400
        border: '#1E293B', // Slate 800
        inputBackground: '#1E293B', // Match border/card for seamless look
        tint: tintColorDark,
        tabIconDefault: '#64748B', // Slate 500
        tabIconSelected: '#3B82F6',
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
        info: '#60A5FA',
        surface: '#151F32',
        surfaceHighlight: '#1E293B',
    },
    // Specialized status colors
    status: {
        verified: '#059669', // Emerald 600
        agent: '#EA580C', // Orange 600
        unverified: '#DC2626', // Red 600
        pending: '#CA8A04', // Yellow 600
    },
    shadow: '#000000',
};
