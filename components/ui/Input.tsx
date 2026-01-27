import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    containerStyle?: ViewStyle;
}

export function Input({
    label,
    error,
    icon,
    containerStyle,
    onFocus,
    onBlur,
    style,
    ...props
}: InputProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const [isFocused, setIsFocused] = useState(false);

    // Animation values
    const focusProgress = useSharedValue(0);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        focusProgress.value = withTiming(1, { duration: 200 });
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        focusProgress.value = withTiming(0, { duration: 200 });
        onBlur?.(e);
    };

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            borderColor: error
                ? theme.error
                : isFocused
                    ? theme.primary
                    : theme.border,
            backgroundColor: isFocused ? theme.background : theme.inputBackground,
        };
    });

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                    {label}
                </Text>
            )}

            <Animated.View style={[
                styles.inputWrapper,
                {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                },
                animatedContainerStyle
            ]}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isFocused ? theme.primary : theme.textSecondary}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    style={[
                        styles.input,
                        { color: theme.text },
                        style
                    ]}
                    placeholderTextColor={theme.textSecondary}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    selectionColor={theme.primary}
                    {...props}
                />
            </Animated.View>

            {error && (
                <Text style={[styles.errorText, { color: theme.error }]}>
                    {error}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 16,
        height: 56,
        paddingHorizontal: 16,
        overflow: 'hidden',
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        height: '100%',
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
