import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <View style={styles.container}>
            {/* Background enhancement - In real app, this would be a nice property image */}
            <LinearGradient
                colors={colorScheme === 'dark'
                    ? ['#0F172A', '#1E3A8A']
                    : ['#EFF6FF', '#FFFFFF']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={[styles.logoContainer, { backgroundColor: theme.surface }]}>
                            <Ionicons name="home" size={48} color={theme.primary} />
                        </View>
                        <View style={styles.brandContainer}>
                            <Text style={[styles.appName, { color: theme.text }]}>HOYAAL</Text>
                            <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                        </View>
                        <Text style={[styles.tagline, { color: theme.textSecondary }]}>
                            Real Estate Made Simple
                        </Text>
                    </View>

                    <View style={styles.hero}>
                        <Text style={[styles.headline, { color: theme.text }]}>
                            Find your dream{'\n'}
                            <Text style={{ color: theme.primary }}>home today</Text>
                        </Text>
                        <Text style={[styles.subheadline, { color: theme.textSecondary }]}>
                            The smartest way to buy, sell, or rent properties in Somalia. Secure, fast, and reliable.
                        </Text>
                    </View>

                    <View style={styles.actions}>
                        <Button
                            title="Get Started"
                            onPress={() => router.push('/(auth)/login')}
                            size="lg"
                            style={styles.primaryBtn}
                            icon="arrow-forward"
                            iconPosition="right"
                        />
                        <Button
                            title="Browse as Guest"
                            variant="secondary"
                            onPress={() => router.replace('/(tabs)')}
                            size="lg"
                        />
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    header: {
        marginTop: 20,
        alignItems: 'center',
    },
    logoContainer: {
        width: 88,
        height: 88,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 6,
    },
    brandContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
        marginBottom: 8,
    },
    appName: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 2,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    tagline: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 1,
        textTransform: 'uppercase',
        opacity: 0.8,
    },
    hero: {
        marginBottom: 40,
    },
    headline: {
        fontSize: 42,
        fontWeight: '800',
        lineHeight: 46,
        marginBottom: 16,
        letterSpacing: -1,
    },
    subheadline: {
        fontSize: 18,
        lineHeight: 28,
        opacity: 0.9,
    },
    actions: {
        gap: 16,
        marginBottom: 16,
    },
    primaryBtn: {
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
    }
});
