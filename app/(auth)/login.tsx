import { supabase } from '@/api/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserRole } from '@/types/auth';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const [phoneNumber, setPhoneNumber] = useState('');
    const [fullName, setFullName] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('SEEKER');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!fullName || phoneNumber.length < 6) {
            return;
        }
        setIsLoading(true);

        try {
            // Use Supabase to send a real OTP to the phone number
            const { error } = await supabase.auth.signInWithOtp({
                phone: `+252${phoneNumber}`,
                options: {
                    data: {
                        full_name: fullName,
                        phone: phoneNumber,
                        role: selectedRole,
                    }
                }
            });

            if (error) throw error;

            setIsLoading(false);
            router.push({
                pathname: '/(auth)/verify',
                params: {
                    phone: phoneNumber,
                    name: fullName,
                    role: selectedRole,
                }
            });
        } catch (error: any) {
            Alert.alert("Auth Error", error.message || "Failed to send verification code.");
        } finally {
            setIsLoading(false);
        }
    };

    const RoleOption = ({ role, label, icon }: { role: UserRole, label: string, icon: any }) => (
        <TouchableOpacity
            style={[
                styles.roleBtn,
                { backgroundColor: theme.inputBackground, borderColor: theme.border },
                selectedRole === role && { borderColor: theme.primary, backgroundColor: theme.primaryLight }
            ]}
            onPress={() => setSelectedRole(role)}
        >
            <Ionicons
                name={icon}
                size={20}
                color={selectedRole === role ? theme.primary : theme.textSecondary}
            />
            <Text style={[
                styles.roleText,
                { color: theme.textSecondary },
                selectedRole === role && { color: theme.primary, fontWeight: '700' }
            ]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <View style={[styles.iconContainer, { backgroundColor: theme.primaryLight }]}>
                            <Ionicons name="home" size={48} color={theme.primary} />
                        </View>
                        <Text style={[styles.title, { color: theme.text }]}>Welcome to Hoyaal</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Somalia's Premier Real Estate Platform
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {/* Full Name Input */}
                        <View style={styles.section}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
                            <Input
                                placeholder="Abdi Ahmed"
                                value={fullName}
                                onChangeText={setFullName}
                                containerStyle={{ marginBottom: 20 }}
                                style={{ fontSize: 16 }}
                            />
                        </View>

                        {/* Role Selection for Testing */}
                        <View style={styles.section}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>I am a...</Text>
                            <View style={styles.roleGrid}>
                                <RoleOption role="SEEKER" label="Seeker" icon="search" />
                                <RoleOption role="OWNER" label="Owner" icon="business" />
                                <RoleOption role="AGENT" label="Agent" icon="shield-checkmark" />
                                <RoleOption role="ADMIN" label="Admin" icon="settings" />
                            </View>
                        </View>

                        <View style={styles.phoneInputContainer}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number</Text>
                            <View style={styles.phoneRow}>
                                <View style={[styles.flagContainer, {
                                    backgroundColor: theme.inputBackground,
                                    borderColor: theme.border
                                }]}>
                                    <Text style={styles.flag}>🇸🇴</Text>
                                    <Text style={[styles.countryCode, { color: theme.text }]}>+252</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Input
                                        placeholder="61 XX XX XXX"
                                        keyboardType="phone-pad"
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                        maxLength={10}
                                        containerStyle={{ marginBottom: 0 }}
                                        style={{ fontSize: 18, letterSpacing: 0.5 }}
                                    />
                                </View>
                            </View>
                        </View>

                        <Button
                            title="Register & Continue"
                            onPress={handleLogin}
                            isLoading={isLoading}
                            disabled={phoneNumber.length < 6 || !fullName}
                            size="lg"
                            style={styles.loginBtn}
                            icon="arrow-forward"
                            iconPosition="right"
                        />
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                            By continuing, you agree to our
                            <Text style={{ color: theme.primary, fontWeight: '600' }}> Terms of Service </Text>
                            and
                            <Text style={{ color: theme.primary, fontWeight: '600' }}> Privacy Policy</Text>.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: '85%',
    },
    form: {
        width: '100%',
    },
    section: {
        marginBottom: 24,
    },
    roleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 8,
    },
    roleBtn: {
        flex: 1,
        minWidth: '45%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1.5,
        gap: 10,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
    },
    phoneInputContainer: {
        marginBottom: 32,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 10,
        marginLeft: 4,
    },
    phoneRow: {
        flexDirection: 'row',
        gap: 12,
    },
    flagContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 12,
        height: 56,
    },
    flag: {
        fontSize: 18,
        marginRight: 6,
    },
    countryCode: {
        fontSize: 15,
        fontWeight: '700',
    },
    loginBtn: {
        shadowColor: "#0056D2",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    footer: {
        marginTop: 32,
        alignItems: 'center',
        paddingBottom: 16,
    },
    footerText: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 20,
    },
});
