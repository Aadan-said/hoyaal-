import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDeposit } from '@/hooks/useTransactions';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PaymentModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    amount: number;
    title?: string;
}

export function PaymentModal({ visible, onClose, onSuccess, amount, title = 'Nidaamka Lacag Bixinta' }: PaymentModalProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { user } = useAuthStore();
    const deposit = useDeposit();

    const [step, setStep] = useState<'method' | 'pin' | 'success'>('method');
    const [method, setMethod] = useState<'EVC' | 'Sahal' | 'Zaad'>('EVC');
    const [pin, setPin] = useState('');
    const [phone, setPhone] = useState(user?.phone || '');

    const handlePayment = async () => {
        if (!pin || pin.length < 4) return;

        try {
            await deposit.mutateAsync({
                userId: user?.id || '',
                amount,
                reference: `${method}-${Math.random().toString(36).substring(7).toUpperCase()}`
            });
            setStep('success');
            setTimeout(() => {
                onSuccess?.();
                handleClose();
            }, 2000);
        } catch (error) {
            alert('Lacag bixintu ma guulaysan.');
        }
    };

    const handleClose = () => {
        setStep('method');
        setPin('');
        onClose();
    };

    const PaymentMethod = ({ type, name, color }: any) => (
        <TouchableOpacity
            style={[styles.methodCard, { borderColor: method === type ? theme.primary : theme.border }]}
            onPress={() => setMethod(type)}
        >
            <View style={[styles.methodDot, { backgroundColor: color }]} />
            <Text style={[styles.methodName, { color: theme.text }]}>{name}</Text>
            {method === type && <Ionicons name="checkmark-circle" size={24} color={theme.primary} />}
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <View style={[styles.content, { backgroundColor: theme.background }]}>
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {step === 'method' && (
                        <View style={styles.body}>
                            <Text style={[styles.label, { color: theme.textSecondary }]}>Dooro habka lacag bixinta:</Text>
                            <PaymentMethod type="EVC" name="EVC Plus (Hormuud)" color="#10B981" />
                            <PaymentMethod type="Sahal" name="Sahal (Telesom)" color="#3B82F6" />
                            <PaymentMethod type="Zaad" name="Zaad (Somtel)" color="#F59E0B" />

                            <View style={styles.amountContainer}>
                                <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>Cadadka:</Text>
                                <Text style={[styles.amountValue, { color: theme.primary }]}>${amount.toFixed(2)}</Text>
                            </View>

                            <Button
                                title="Sii wad"
                                onPress={() => setStep('pin')}
                                variant="primary"
                                style={{ marginTop: 20 }}
                            />
                        </View>
                    )}

                    {step === 'pin' && (
                        <View style={styles.body}>
                            <Text style={[styles.pinLabel, { color: theme.text }]}>Gali PIN-kaaga si aad u xaqiijisid lacag bixinta ${amount}</Text>
                            <Text style={[styles.phoneNumber, { color: theme.textSecondary }]}>Mobile: {phone}</Text>

                            <TextInput
                                style={[styles.pinInput, { color: theme.text, borderColor: theme.border }]}
                                placeholder="PIN"
                                placeholderTextColor={theme.textSecondary}
                                secureTextEntry
                                keyboardType="number-pad"
                                maxLength={6}
                                value={pin}
                                onChangeText={setPin}
                                autoFocus
                            />

                            <Button
                                title={deposit.isPending ? "Fariintu way socotaa..." : "Bixi Hadda"}
                                onPress={handlePayment}
                                variant="primary"
                                disabled={deposit.isPending}
                                style={{ marginTop: 20 }}
                            />

                            <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={() => setStep('method')}>
                                <Text style={{ color: theme.textSecondary }}>Hagaajin habka lacag bixinta</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 'success' && (
                        <View style={styles.successBody}>
                            <View style={[styles.successIcon, { backgroundColor: '#10B98120' }]}>
                                <Ionicons name="checkmark-circle" size={80} color="#10B981" />
                            </View>
                            <Text style={[styles.successTitle, { color: theme.text }]}>Waa lagu guulaystay!</Text>
                            <Text style={[styles.successMsg, { color: theme.textSecondary }]}>Lacagta dhalidda waa la xaqiijiyay. Balance-kaaga waa la cusubaysiiyay.</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    content: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, minHeight: 450 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    headerTitle: { fontSize: 20, fontWeight: '800' },
    body: { gap: 12 },
    label: { fontSize: 14, marginBottom: 8 },
    methodCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1.5, gap: 12 },
    methodDot: { width: 12, height: 12, borderRadius: 6 },
    methodName: { flex: 1, fontSize: 16, fontWeight: '600' },
    amountContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    amountLabel: { fontSize: 16, fontWeight: '600' },
    amountValue: { fontSize: 24, fontWeight: '800' },
    pinLabel: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
    phoneNumber: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
    pinInput: { borderWidth: 1.5, borderRadius: 16, padding: 16, fontSize: 24, textAlign: 'center', fontWeight: '800', letterSpacing: 8 },
    successBody: { alignItems: 'center', paddingVertical: 40 },
    successIcon: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    successTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
    successMsg: { fontSize: 16, textAlign: 'center', lineHeight: 24 }
});
