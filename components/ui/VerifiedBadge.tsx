import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface VerifiedBadgeProps {
    size?: number;
    showText?: boolean;
}

export const VerifiedBadge = ({ size = 16, showText = false }: VerifiedBadgeProps) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <Ionicons name="checkmark-circle" size={size} color={theme.primary} />
            {showText && (
                <Text style={[styles.text, { color: theme.primary, fontSize: size - 4 }]}>Verified</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    text: {
        fontWeight: '700',
    }
});
