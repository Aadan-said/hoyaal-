import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: any;
}

export function LoadingSpinner({ size = 'large', color, style }: LoadingSpinnerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator
        size={size}
        color={color || theme.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
