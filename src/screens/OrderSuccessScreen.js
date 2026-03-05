import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

// Animated confetti dot
const ConfettiDot = ({ delay, x, color, size }) => {
    const animY = useRef(new Animated.Value(-20)).current;
    const animO = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.timing(animY, { toValue: 60, duration: 1500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                    Animated.sequence([
                        Animated.timing(animO, { toValue: 1, duration: 400, useNativeDriver: true }),
                        Animated.timing(animO, { toValue: 0, duration: 600, delay: 500, useNativeDriver: true }),
                    ]),
                ]),
                Animated.parallel([
                    Animated.timing(animY, { toValue: -20, duration: 0, useNativeDriver: true }),
                    Animated.timing(animO, { toValue: 0, duration: 0, useNativeDriver: true }),
                ]),
            ])
        ).start();
    }, []);

    return (
        <Animated.View
            style={{
                position: 'absolute', left: x, top: 0,
                width: size, height: size, borderRadius: size / 2,
                backgroundColor: color,
                transform: [{ translateY: animY }],
                opacity: animO,
            }}
        />
    );
};

const CONFETTI = [
    { delay: 0, x: '10%', color: COLORS.primary, size: 10 },
    { delay: 300, x: '30%', color: '#FFB800', size: 8 },
    { delay: 150, x: '55%', color: '#FF4C4C', size: 12 },
    { delay: 450, x: '75%', color: COLORS.primary, size: 8 },
    { delay: 600, x: '90%', color: '#FFB800', size: 10 },
];

export default function OrderSuccessScreen({ navigation }) {
    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1, friction: 4, tension: 60, useNativeDriver: true,
        }).start();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            {/* Confetti */}
            <View style={styles.confettiContainer} pointerEvents="none">
                {CONFETTI.map((c, i) => <ConfettiDot key={i} {...c} />)}
            </View>

            <View style={styles.content}>
                {/* Animated check circle */}
                <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}>
                    <Ionicons name="checkmark" size={70} color={COLORS.white} />
                </Animated.View>

                <Text style={styles.title}>Order Placed!</Text>
                <Text style={styles.subtitle}>
                    Your order has been placed successfully. You'll receive an email confirmation shortly.
                </Text>

                {/* Order ID */}
                <View style={styles.orderIdBox}>
                    <Text style={styles.orderIdLabel}>Order ID</Text>
                    <Text style={styles.orderId}>#PTK-{Math.floor(100000 + Math.random() * 900000)}</Text>
                </View>

                {/* Step progress dots */}
                <View style={styles.stepsRow}>
                    {['Confirmed', 'Processing', 'Shipping', 'Delivered'].map((step, i) => (
                        <View key={step} style={styles.stepItem}>
                            <View style={[styles.stepDot, i === 0 && styles.stepDotActive]} />
                            <Text style={[styles.stepLabel, i === 0 && styles.stepLabelActive]}>{step}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <Button
                    title="Track Your Order"
                    onPress={() => navigation.navigate('Main', { screen: 'Orders' })}
                    style={styles.trackBtn}
                />
                <Button
                    variant="outline"
                    title="Continue Shopping"
                    onPress={() => navigation.navigate('Main')}
                    style={styles.shopBtn}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    confettiContainer: {
        position: 'absolute', top: 60, left: 0, right: 0, height: 80, overflow: 'hidden',
    },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
    iconCircle: {
        width: 140, height: 140, borderRadius: 70,
        backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
        marginBottom: SPACING.xl,
        shadowColor: COLORS.primary, shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
    },
    title: { ...TYPOGRAPHY.h2, fontSize: 28, textAlign: 'center', marginBottom: SPACING.md },
    subtitle: { ...TYPOGRAPHY.body, textAlign: 'center', color: COLORS.textLight, lineHeight: 24, marginBottom: SPACING.xl },
    orderIdBox: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
        backgroundColor: COLORS.primaryLight, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg,
        borderRadius: 20, marginBottom: SPACING.xxl,
    },
    orderIdLabel: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight },
    orderId: { ...TYPOGRAPHY.body, color: COLORS.primary, fontWeight: '700' },
    stepsRow: { flexDirection: 'row', gap: SPACING.md },
    stepItem: { alignItems: 'center', gap: 4 },
    stepDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.border },
    stepDotActive: { backgroundColor: COLORS.primary, width: 16, height: 16, borderRadius: 8 },
    stepLabel: { fontSize: 10, color: COLORS.textLight },
    stepLabelActive: { color: COLORS.primary, fontWeight: '600' },
    footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, gap: SPACING.sm },
    trackBtn: { borderRadius: 30 },
    shopBtn: { borderRadius: 30 },
});
