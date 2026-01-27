import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    style,
    textStyle,
    icon,
    iconPosition = 'left'
}: ButtonProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 10, stiffness: 300 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    };

    const getBackgroundColor = () => {
        if (disabled) return theme.border;
        switch (variant) {
            case 'primary': return theme.primary;
            case 'secondary': return theme.surfaceHighlight;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            case 'danger': return theme.error;
            default: return theme.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return theme.textSecondary;
        switch (variant) {
            case 'primary': return '#FFFFFF';
            case 'secondary': return theme.text;
            case 'outline': return theme.primary;
            case 'ghost': return theme.textSecondary;
            case 'danger': return '#FFFFFF';
            default: return '#FFFFFF';
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'sm': return { paddingVertical: 8, paddingHorizontal: 16 };
            case 'md': return { paddingVertical: 12, paddingHorizontal: 20 };
            case 'lg': return { paddingVertical: 16, paddingHorizontal: 28 };
            case 'xl': return { paddingVertical: 18, paddingHorizontal: 32 };
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'sm': return 13;
            case 'md': return 15;
            case 'lg': return 17;
            case 'xl': return 18;
        }
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || isLoading}
            style={[
                styles.container,
                { backgroundColor: getBackgroundColor() },
                variant === 'outline' && { borderWidth: 1.5, borderColor: theme.border },
                variant === 'primary' && !disabled && styles.shadow,
                getPadding(),
                style,
                animatedStyle
            ]}
        >
            {isLoading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <Ionicons name={icon} size={getFontSize() + 4} color={getTextColor()} style={{ marginRight: 8 }} />
                    )}
                    <Text style={[
                        styles.text,
                        { color: getTextColor(), fontSize: getFontSize() },
                        textStyle
                    ]}>
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && (
                        <Ionicons name={icon} size={getFontSize() + 4} color={getTextColor()} style={{ marginLeft: 8 }} />
                    )}
                </>
            )}
        </AnimatedPressable>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16, // Smoother corners for premium feel
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    shadow: {
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    text: {
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});
