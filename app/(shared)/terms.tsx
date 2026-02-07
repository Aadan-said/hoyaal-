import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsScreen() {
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
                <Text style={[styles.headerTitle, { color: theme.text }]}>Terms of Service</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>Last Updated: February 2026</Text>

                <Section
                    title="1. Introduction"
                    content="Welcome to Hoyaal. By using our application, you agree to these terms. Please read them carefully. Hoyaal is a platform connecting property owners and seekers in Somalia."
                />

                <Section
                    title="2. User Accounts"
                    content="You are responsible for maintaining the confidentiality of your account. You must provide accurate information when registering. Users found providing false information may have their accounts suspended."
                />

                <Section
                    title="3. Property Listings"
                    content="Owners and Agents are responsible for the accuracy of their listings. Hoyaal does not guarantee the availability or condition of any property listed. All properties must undergo a verification process."
                />

                <Section
                    title="4. Fees and Payments"
                    content="Hoyaal may charge fees for premium features. All payments are final unless otherwise stated. We use secure third-party payment processors."
                />

                <Section
                    title="5. Prohibited Actions"
                    content="Users may not post fraudulent listings, harass other users, or attempt to scrape data from the platform. Violation of these rules will result in an immediate ban."
                />

                <Section
                    title="6. Limitation of Liability"
                    content="Hoyaal is not liable for any disputes between owners and tenants. We provide the platform but do not participate in legal agreements between parties."
                />

                <Section
                    title="7. Shuruudaha iyo Qawaaniinta"
                    content="Ku soo dhawaada Hoyaal. Markaad isticmaashid app-kan, waxaad ogolaatay shuruudahayaga. Hoyaal waa madal isku xirta dadka guryaha kireeya iyo kuwa raba inay kireystaan."
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
