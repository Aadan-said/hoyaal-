import { supabase } from '@/api/supabase';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from '@/types/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifyScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { phone, role, name } = useLocalSearchParams();
    const register = useAuthStore((state) => state.register);

    const [code, setCode] = useState<string[]>(['', '', '', '', '', '']); // 6 digits
    const [timer, setTimer] = useState(45);
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleCodeChange = (text: string, index: number) => {
        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Auto-focus next input
        if (text.length === 1 && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        // Auto-focus prev input on delete
        if (text.length === 0 && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = code.join('');
        if (otpCode.length === 6) {
            setIsVerifying(true);

            try {
                // 1. Verify OTP with Supabase
                const { data: { user }, error } = await supabase.auth.verifyOtp({
                    phone: `+252${phone}`,
                    token: otpCode,
                    type: 'sms',
                });

                if (error) throw error;

                if (user) {
                    // 2. Register/Update profile in database
                    await register({
                        id: user.id,
                        phone: user.phone || phone as string,
                        name: (name as string) || `User ${phone}`,
                        role: (role as UserRole) || 'SEEKER',
                    });

                    router.replace('/(tabs)');
                }
            } catch (error: any) {
                import('react-native').then(({ Alert }) => {
                    Alert.alert("Verification Failed", error.message || "Invalid or expired code.");
                });
            } finally {
                setIsVerifying(false);
            }
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient
                colors={colorScheme === 'dark'
                    ? ['#020617', '#1E3A8A', '#020617']
                    : ['#F8FAFC', '#DBEAFE', '#F8FAFC']}
                style={StyleSheet.absoluteFill}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backButton, { backgroundColor: theme.card, borderColor: theme.border }]}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>

                <View style={styles.header}>
                    <Text style={[styles.title, { color: theme.text }]}>Verify Code</Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Enter the 4-digit verification code sent to{'\n'}
                        <Text style={{ color: theme.primary, fontWeight: '600' }}>+252 {phone}</Text>
                    </Text>
                </View>

                <View style={styles.otpContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputRefs.current[index] = ref; }}
                            style={[
                                styles.otpInput,
                                {
                                    backgroundColor: theme.inputBackground,
                                    color: theme.text,
                                    borderColor: digit ? theme.primary : theme.border,
                                    shadowColor: digit ? theme.primary : "transparent",
                                    elevation: digit ? 4 : 0,
                                }
                            ]}
                            maxLength={1}
                            keyboardType="number-pad"
                            value={digit}
                            onChangeText={(text) => handleCodeChange(text, index)}
                            onKeyPress={({ nativeEvent }) => {
                                if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                                    inputRefs.current[index - 1]?.focus();
                                }
                            }}
                        />
                    ))}
                </View>

                <View style={styles.resendContainer}>
                    <Text style={[styles.resendText, { color: theme.textSecondary }]}>
                        Didn't receive the code?
                    </Text>
                    {timer > 0 ? (
                        <Text style={[styles.timer, { color: theme.primary }]}>
                            Resend in 00:{timer < 10 ? `0${timer}` : timer}
                        </Text>
                    ) : (
                        <TouchableOpacity onPress={() => setTimer(45)}>
                            <Text style={[styles.resendLink, { color: theme.primary }]}>Resend Code</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.footer}>
                    <Button
                        title="Verify Account"
                        onPress={handleVerify}
                        isLoading={isVerifying}
                        disabled={code.join('').length !== 6}
                        size="lg"
                        style={styles.verifyBtn}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    backButton: {
        marginBottom: 32,
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    otpInput: {
        width: 52,
        height: 64,
        borderWidth: 1.5,
        borderRadius: 16,
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
    },
    resendContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    resendText: {
        fontSize: 15,
        marginBottom: 4,
    },
    timer: {
        fontSize: 15,
        fontWeight: '600',
    },
    resendLink: {
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        marginTop: 'auto',
    },
    verifyBtn: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    }
});
