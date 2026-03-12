import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

const ConfettiDot = ({ delay, x, color, size }) => {
    const animY = useRef(new Animated.Value(-20)).current;
    const animO = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
                Animated.timing(animY, { toValue: 600, duration: 2500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                Animated.sequence([
                    Animated.timing(animO, { toValue: 1, duration: 400, useNativeDriver: true }),
                    Animated.timing(animO, { toValue: 0, duration: 1000, delay: 1000, useNativeDriver: true }),
                ]),
            ]),
            Animated.parallel([
                Animated.timing(animY, { toValue: -20, duration: 0, useNativeDriver: true }),
                Animated.timing(animO, { toValue: 0, duration: 0, useNativeDriver: true }),
            ]),
        ])).start();
    }, []);
    return <Animated.View style={{ position: 'absolute', left: x, top: 0, width: size, height: size, borderRadius: size / 2, backgroundColor: color, transform: [{ translateY: animY }], opacity: animO }} />;
};

const CONFETTI = [
    { delay: 0, x: '10%', color: COLORS.primary, size: 10 },
    { delay: 300, x: '30%', color: '#FFB800', size: 8 },
    { delay: 150, x: '55%', color: '#FF4C4C', size: 12 },
    { delay: 450, x: '75%', color: COLORS.primary, size: 8 },
    { delay: 600, x: '90%', color: '#FFB800', size: 10 },
];

export default function OrderSuccessScreen() {
    const { orderId = '#PTK-000000', total = 0 } = useLocalSearchParams();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const { colors, isDark } = useTheme();
    const router = useRouter();

    useEffect(() => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }).start();
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.confettiContainer} pointerEvents="none">{CONFETTI.map((c, i) => <ConfettiDot key={i} {...c} />)}</View>
            <View style={styles.content}>
                <Animated.View style={[styles.iconCircle, { transform: [{ scale: scaleAnim }] }]}><Ionicons name="checkmark" size={70} color={COLORS.white} /></Animated.View>
                <Text style={[styles.title, { color: colors.text }]}>Order Placed!</Text>
                <Text style={[styles.subtitle, { color: colors.textLight }]}>Your order of ${Number(total).toFixed(2)} was successful. You'll receive an email shortly.</Text>
                <View style={[styles.orderIdBox, { backgroundColor: isDark ? 'rgba(76, 175, 80, 0.1)' : COLORS.primaryLight }]}>
                    <Text style={[styles.orderIdLabel, { color: colors.textLight }]}>Order ID</Text>
                    <Text style={[styles.orderId, { color: COLORS.primary }]}>{orderId}</Text>
                </View>
            </View>
            <View style={styles.footer}>
                <Button title="View Receipt" onPress={() => router.push({ pathname: '/(main)/e-receipt', params: { id: orderId } })} style={styles.receiptBtn} />
                <Button title="Back to Home" onPress={() => router.replace('/(main)/(tabs)/home')} variant="outline" style={styles.homeBtn} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    confettiContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
    iconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    title: { fontSize: 28, fontWeight: '700', marginBottom: 16 },
    subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
    orderIdBox: { padding: 20, borderRadius: 24, alignItems: 'center', width: '100%' },
    orderIdLabel: { fontSize: 14, marginBottom: 4 },
    orderId: { fontSize: 18, fontWeight: '700' },
    footer: { padding: 24, gap: 16 },
    receiptBtn: { width: '100%' },
    homeBtn: { width: '100%' },
});
