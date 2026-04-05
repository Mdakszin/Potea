import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { subscriptionService } from '../../src/services/subscriptionService';
import { paymentService } from '../../src/services/paymentService';
import { SubscriptionPlan, SubscriptionTier, UserSubscription } from '../../src/types';
import { useStripe } from '@stripe/stripe-react-native';

export default function SubscriptionScreen() {
    const { colors } = useTheme();
    const { currentUser } = useAuth();
    const router = useRouter();

    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState<string | null>(null);
    const { initPaymentSheet, presentPaymentSheet } = useStripe();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!currentUser) return;
        try {
            const [sub] = await Promise.all([
                subscriptionService.getUserSubscription(currentUser.uid),
            ]);
            setCurrentSub(sub);
            setPlans(subscriptionService.getPlans());
        } catch (err) {
            console.error('Error loading subscription data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = (plan: SubscriptionPlan) => {
        if (!currentUser || !currentSub) return;

        if (plan.id === currentSub.planId) return;

        if (plan.id === 'free') {
            Alert.alert(
                'Downgrade to Free?',
                'You will lose access to premium features at the end of your billing cycle.',
                [
                    { text: 'Keep Plan', style: 'cancel' },
                    {
                        text: 'Downgrade',
                        style: 'destructive',
                        onPress: async () => {
                            setSubscribing(plan.id);
                            await subscriptionService.cancelSubscription(currentUser.uid);
                            Alert.alert('Plan Changed', 'You are now on the Free plan.');
                            loadData();
                            setSubscribing(null);
                        },
                    },
                ]
            );
            return;
        }

        Alert.alert(
            `Upgrade to ${plan.name}?`,
            `R${plan.price}/month — ${plan.description}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: `Subscribe — R${plan.price}/mo`,
                    onPress: async () => {
                        setSubscribing(plan.id);
                        
                        try {
                            // 1. Get client secret from our Stripe wrapper
                            const { clientSecret, error: intentError } = await paymentService.createPaymentIntent(plan.price);
                            if (intentError || !clientSecret) {
                                throw new Error(intentError || 'Failed to initialize payment.');
                            }

                            // 2. Initialize Payment Sheet
                            const { error: initError } = await initPaymentSheet({
                                paymentIntentClientSecret: clientSecret,
                                merchantDisplayName: 'Potea Plants',
                            });
                            if (initError) {
                                throw new Error(initError.message);
                            }

                            // 3. Present Payment Sheet
                            const { error: paymentError } = await presentPaymentSheet();
                            if (paymentError) {
                                // User cancelled or payment failed
                                if (paymentError.code !== 'Canceled') {
                                    Alert.alert('Payment Failed', paymentError.message);
                                }
                                setSubscribing(null);
                                return;
                            }

                            // 4. Payment Success - Update Firestore
                            await subscriptionService.subscribeToPlan(currentUser.uid, plan.id);
                            Alert.alert('🎉 Welcome!', `You are now a ${plan.name} member!`);
                            loadData();
                        } catch (err: any) {
                            Alert.alert('Error', err.message || 'Something went wrong.');
                        } finally {
                            setSubscribing(null);
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Premium Plans</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Hero */}
                <View style={styles.hero}>
                    <Text style={styles.heroEmoji}>💎</Text>
                    <Text style={[styles.heroTitle, { color: colors.text }]}>Unlock Premium</Text>
                    <Text style={[styles.heroSub, { color: colors.textLight }]}>
                        Get the most out of your plant journey with exclusive features and perks
                    </Text>
                </View>

                {/* Plan Cards */}
                {plans.map((plan) => {
                    const isCurrent = currentSub?.planId === plan.id;
                    const isHighlighted = plan.highlighted;

                    return (
                        <View
                            key={plan.id}
                            style={[
                                styles.planCard,
                                {
                                    backgroundColor: colors.card,
                                    borderColor: isCurrent ? plan.color : colors.border,
                                    borderWidth: isCurrent || isHighlighted ? 2 : 1,
                                },
                            ]}
                        >
                            {/* Popular Badge */}
                            {isHighlighted && !isCurrent && (
                                <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                                    <Text style={styles.popularText}>MOST POPULAR</Text>
                                </View>
                            )}

                            {/* Current Badge */}
                            {isCurrent && (
                                <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                                    <Text style={styles.popularText}>CURRENT PLAN</Text>
                                </View>
                            )}

                            {/* Plan Header */}
                            <View style={styles.planHeader}>
                                <View style={[styles.planIconBg, { backgroundColor: plan.color + '20' }]}>
                                    <Ionicons name={plan.icon as any} size={24} color={plan.color} />
                                </View>
                                <View style={styles.planHeaderText}>
                                    <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                                    <Text style={[styles.planDesc, { color: colors.textLight }]}>{plan.description}</Text>
                                </View>
                            </View>

                            {/* Price */}
                            <View style={styles.priceRow}>
                                <Text style={[styles.priceValue, { color: plan.color }]}>
                                    {plan.price === 0 ? 'Free' : `R${plan.price}`}
                                </Text>
                                {plan.price > 0 && (
                                    <Text style={[styles.priceUnit, { color: colors.textLight }]}>/month</Text>
                                )}
                            </View>

                            {/* Features */}
                            <View style={styles.featuresList}>
                                {plan.features.map((feature, i) => (
                                    <View key={i} style={styles.featureRow}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={18}
                                            color={plan.color}
                                            style={{ marginRight: 8 }}
                                        />
                                        <Text style={[styles.featureText, { color: colors.text }]}>
                                            {feature}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {/* Action Button */}
                            <TouchableOpacity
                                style={[
                                    styles.planBtn,
                                    {
                                        backgroundColor: isCurrent ? colors.border : plan.color,
                                    },
                                ]}
                                onPress={() => handleSubscribe(plan)}
                                disabled={isCurrent || subscribing === plan.id}
                            >
                                {subscribing === plan.id ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={[styles.planBtnText, { color: isCurrent ? colors.textLight : '#fff' }]}>
                                        {isCurrent
                                            ? 'Current Plan'
                                            : plan.price === 0
                                                ? 'Downgrade'
                                                : currentSub && currentSub.planId !== 'free'
                                                    ? 'Switch Plan'
                                                    : 'Subscribe'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    );
                })}

                {/* Footer Note */}
                <View style={styles.footer}>
                    <Ionicons name="shield-checkmark" size={16} color={colors.textLight} />
                    <Text style={[styles.footerText, { color: colors.textLight }]}>
                        Cancel anytime. No hidden fees. Secure payment.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },

    // Hero
    hero: { alignItems: 'center', paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xl },
    heroEmoji: { fontSize: 48, marginBottom: 8 },
    heroTitle: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
    heroSub: { fontSize: 15, textAlign: 'center', lineHeight: 22 },

    // Plan Card
    planCard: {
        marginHorizontal: SPACING.lg, borderRadius: 20, padding: SPACING.lg,
        marginBottom: SPACING.md, overflow: 'hidden', position: 'relative',
    },
    popularBadge: {
        position: 'absolute', top: 0, right: 20,
        paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    },
    popularText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 1 },

    planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, marginTop: 4 },
    planIconBg: {
        width: 48, height: 48, borderRadius: 14, alignItems: 'center',
        justifyContent: 'center', marginRight: SPACING.md,
    },
    planHeaderText: { flex: 1 },
    planName: { fontSize: 20, fontWeight: '800' },
    planDesc: { fontSize: 13, marginTop: 2 },

    priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
    priceValue: { fontSize: 36, fontWeight: '800' },
    priceUnit: { fontSize: 16, marginLeft: 4 },

    featuresList: { marginBottom: SPACING.md },
    featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    featureText: { fontSize: 14, flex: 1 },

    planBtn: {
        height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    },
    planBtnText: { fontSize: 16, fontWeight: '700' },

    // Footer
    footer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: SPACING.lg,
    },
    footerText: { fontSize: 13 },
});
