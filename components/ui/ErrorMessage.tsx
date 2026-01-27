import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorMessage({ message, onRetry, retryText = 'Try Again' }: ErrorMessageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.content, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.error + '20' }]}>
          <Ionicons name="alert-circle" size={24} color={theme.error} />
        </View>
        <Text style={[styles.message, { color: theme.text }]}>{message}</Text>
        {onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={16} color="#FFF" />
            <Text style={styles.retryText}>{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 320,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
