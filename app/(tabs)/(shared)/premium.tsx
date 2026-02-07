import { PaymentModal } from '@/components/modals/PaymentModal';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProfile } from '@/hooks/useProfile';
import { useDeposit, useSubscribe } from '@/hooks/useTransactions';
import { useAuthStore } from '@/store/useAuthStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PremiumScreen() {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuthStore();
    const { data: profile } = useProfile(user?.id || '');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentType, setPaymentType] = useState<'deposit' | 'subscription'>('deposit');
    const [selectedAmount, setSelectedAmount] = useState(0);
    const [selectedPlan, setSelectedPlan] = useState<'premium' | 'enterprise' | null>(null);

    const deposit = useDeposit();
    const subscribe = useSubscribe();

    const handleDeposit = (amount: number) => {
        setSelectedAmount(amount);
        setPaymentType('deposit');
        setShowPaymentModal(true);
    };

    const handleSubscribe = (plan: 'premium' | 'enterprise', price: number) => {
        setSelectedPlan(plan);
        setSelectedAmount(price);
        setPaymentType('subscription');
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async () => {
        if (paymentType === 'deposit') {
            await deposit.mutateAsync({
                userId: user?.id || '',
                amount: selectedAmount,
                reference: `DEPOSIT-${Date.now()}`
            });
        } else if (selectedPlan) {
            await subscribe.mutateAsync({
                userId: user?.id || '',
                amount: selectedAmount,
                planName: selectedPlan
            });
        }
        setShowPaymentModal(false);
    };

    const quickAmounts = [10, 25, 50, 100];

    const plans = [
        {
            id: 'premium',
            name: 'Premium',
            price: 29,
            icon: 'star',
            color: '#F59E0B',
            features: [
                'Unlimited property listings',
                'Featured badge on all listings',
                'Priority customer support',
                'Advanced analytics dashboard',
            ],
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 99,
            icon: 'rocket',
            color: '#8B5CF6',
            features: [
                'Everything in Premium',
                'Dedicated account manager',
                'Custom branding options',
                'API access for integrations',
                'White-label solutions',
            ],
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: '#F8F9FA' }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <LinearGradient
                    colors={[theme.primary, theme.primaryLight]}
                    style={[styles.headerGradient, { paddingTop: insets.top + 20 }]}
                >
                    <View style={styles.headerContent}>
                        <View>
                            <Text style={styles.headerTitle}>Premium</Text>
                            <Text style={styles.headerSubtitle}>Upgrade your experience</Text>
                        </View>
                        {profile?.is_premium && (
                            <View style={styles.premiumBadge}>
                                <Ionicons name="star" size={16} color="#FFF" />
                                <Text style={styles.premiumBadgeText}>ACTIVE</Text>
                            </View>
                        )}
                    </View>
                </LinearGradient>
                {/* Wallet Section */}
                <View style={[styles.section, { backgroundColor: theme.card }]}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleRow}>
                            <Ionicons name="wallet" size={24} color={theme.primary} />
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>Wallet & Balance</Text>
                        </View>
                    </View>

                    <LinearGradient
                        colors={[theme.primary, theme.primaryLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.balanceCardUnified}
                    >
                        <View style={styles.balanceInfo}>
                            <Text style={styles.balanceLabelWhite}>Hambaliyo, Available Balance</Text>
                            <Text style={styles.balanceAmountWhite}>
                                ${profile?.balance?.toFixed(2) || '0.00'}
                            </Text>
                        </View>
                        <View style={styles.balanceIconBg}>
                            <Ionicons name="cash" size={40} color="rgba(255,255,255,0.2)" />
                        </View>
                    </LinearGradient>

                    <Text style={[styles.quickTopupTitle, { color: theme.text }]}>Ku dar Lacag (Top-up)</Text>
                    <View style={styles.quickAmounts}>
                        {quickAmounts.map((amount) => (
                            <TouchableOpacity
                                key={amount}
                                style={[styles.amountBtnUnified, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}
                                onPress={() => handleDeposit(amount)}
                            >
                                <Text style={[styles.amountTextUnified, { color: theme.text }]}>${amount}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Subscription Plans */}
                {!profile?.is_premium && (
                    <View style={[styles.section, { backgroundColor: theme.card }]}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleRow}>
                                <Ionicons name="sparkles" size={24} color={theme.primary} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Subscription Plans</Text>
                            </View>
                        </View>

                        {plans.map((plan) => (
                            <View key={plan.id} style={[styles.planCard, { borderColor: theme.border }]}>
                                <LinearGradient
                                    colors={[plan.color + '10', 'transparent']}
                                    style={styles.planGradient}
                                />
                                <View style={styles.planHeader}>
                                    <View style={[styles.planIcon, { backgroundColor: plan.color }]}>
                                        <Ionicons name={plan.icon as any} size={24} color="#FFF" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.planName, { color: theme.text }]}>{plan.name}</Text>
                                        <Text style={[styles.planPrice, { color: theme.primary }]}>
                                            ${plan.price}<Text style={styles.planPeriod}>/month</Text>
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.planFeatures}>
                                    {plan.features.map((feature, index) => (
                                        <View key={index} style={styles.featureRow}>
                                            <Ionicons name="checkmark-circle" size={18} color={plan.color} />
                                            <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                                                {feature}
                                            </Text>
                                        </View>
                                    ))}
                                </View>

                                <TouchableOpacity
                                    style={[styles.subscribeBtn, { backgroundColor: plan.color }]}
                                    onPress={() => handleSubscribe(plan.id as any, plan.price)}
                                >
                                    <Text style={styles.subscribeBtnText}>Subscribe Now</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Premium Benefits */}
                {profile?.is_premium && (
                    <View style={[styles.section, { backgroundColor: theme.card }]}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitleRow}>
                                <Ionicons name="gift" size={24} color={theme.primary} />
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Benefits</Text>
                            </View>
                        </View>

                        <View style={styles.benefitsList}>
                            {[
                                { icon: 'infinite', text: 'Unlimited property listings' },
                                { icon: 'star', text: 'Featured badge on all listings' },
                                { icon: 'headset', text: 'Priority customer support' },
                                { icon: 'analytics', text: 'Advanced analytics dashboard' },
                            ].map((benefit, index) => (
                                <View key={index} style={styles.benefitRow}>
                                    <View style={[styles.benefitIcon, { backgroundColor: theme.primaryLight }]}>
                                        <Ionicons name={benefit.icon as any} size={20} color={theme.primary} />
                                    </View>
                                    <Text style={[styles.benefitText, { color: theme.text }]}>{benefit.text}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            <PaymentModal
                visible={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                amount={selectedAmount}
                onSuccess={handlePaymentSuccess}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -1,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#FFF',
        opacity: 0.9,
        marginTop: 4,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    premiumBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '900',
    },
    scrollContent: {
        paddingBottom: 120,
    },
    section: {
        marginHorizontal: 20,
        borderRadius: 24,
        padding: 24,
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionHeader: {
        marginBottom: 20,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    balanceCardUnified: {
        padding: 24,
        borderRadius: 24,
        marginBottom: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
    },
    balanceInfo: {
        flex: 1,
    },
    balanceLabelWhite: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    balanceAmountWhite: {
        fontSize: 36,
        fontWeight: '900',
        color: '#FFF',
        letterSpacing: -1,
    },
    balanceIconBg: {
        marginLeft: 12,
    },
    quickTopupTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    quickAmounts: {
        flexDirection: 'row',
        gap: 12,
    },
    amountBtnUnified: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    amountTextUnified: {
        fontSize: 16,
        fontWeight: '800',
    },
    planCard: {
        borderWidth: 2,
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        overflow: 'hidden',
    },
    planGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    planHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 20,
    },
    planIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    planName: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    planPrice: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: -1,
    },
    planPeriod: {
        fontSize: 14,
        fontWeight: '600',
        opacity: 0.6,
    },
    planFeatures: {
        gap: 12,
        marginBottom: 20,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureText: {
        fontSize: 15,
        flex: 1,
    },
    subscribeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 8,
    },
    subscribeBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    benefitsList: {
        gap: 16,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    benefitIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    benefitText: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
});
