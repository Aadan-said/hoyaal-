import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const Section = ({ title, content }: { title: string, content: string }) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.content, { color: theme.textSecondary }]}>{content}</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>Last Updated: February 2026</Text>

                <Section
                    title="1. Information We Collect"
                    content="We collect information you provide directly to us, such as when you create an account, post a property, or contact us. This includes your name, phone number, and location data."
                />

                <Section
                    title="2. How We Use Information"
                    content="We use your information to provide, maintain, and improve our services, to process transactions, and to communicate with you about listings and updates."
                />

                <Section
                    title="3. Sharing of Information"
                    content="We share your contact information with other users only when you post a listing or make an offer, to facilitate communication between parties."
                />

                <Section
                    title="4. Data Security"
                    content="We use Supabase as our backend provide, which implements industry-standard security measures to protect your data. However, no method of transmission is 100% secure."
                />

                <Section
                    title="5. Your Choices"
                    content="You can access and update your profile information at any time through the app settings. You may also request deletion of your account."
                />

                <Section
                    title="6. Somali Context"
                    content="Macluumaadkaaga waa noo muhiim. Waxaan u isticmaalnaa oo kaliya inaan kuugu adeegno. Ma la wadaagno dhinac saddexaad oo aan ogolaansho ka haysan."
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    scrollContent: {
        padding: 24,
    },
    lastUpdated: {
        fontSize: 14,
        marginBottom: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
    },
    content: {
        fontSize: 15,
        lineHeight: 24,
    }
});
