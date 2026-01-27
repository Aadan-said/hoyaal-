import { Colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type BadgeType = 'verified' | 'agent' | 'unverified';

interface BadgeProps {
    type: BadgeType;
}

export function Badge({ type }: BadgeProps) {
    const getBadgeConfig = () => {
        switch (type) {
            case 'verified':
                return {
                    bg: '#DCFCE7', // Light green 
                    text: Colors.status.verified,
                    label: 'HOYAAL Verified'
                };
            case 'agent':
                return {
                    bg: '#FEF3C7', // Light yellow
                    text: Colors.status.agent,
                    label: 'Agent Verified'
                };
            case 'unverified':
                return {
                    bg: '#FEE2E2', // Light red
                    text: Colors.status.unverified,
                    label: 'Unverified'
                };
        }
    };

    const config = getBadgeConfig();

    return (
        <View style={[styles.container, { backgroundColor: config.bg }]}>
            <Text style={[styles.text, { color: config.text }]}>
                {config.label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 100,
        alignSelf: 'flex-start',
    },
    text: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
});
