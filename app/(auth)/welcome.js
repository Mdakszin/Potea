import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const router = useRouter();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const logoScale = useRef(new Animated.Value(0.7)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(logoScale, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1200,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} />

            <SafeAreaView style={styles.safeArea}>
                <Animated.View style={[styles.topSection, { opacity: fadeAnim, transform: [{ scale: logoScale }] }]}>
                    <View style={styles.logoCircle}>
                        <Ionicons name="leaf" size={36} color="#FFFFFF" />
                    </View>
                </Animated.View>

                <View style={styles.middleSection}>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: logoScale }] }}>
                        <Text style={styles.welcomeLabel}>WELCOME TO</Text>
                        <Text style={styles.brandName}>Potea</Text>
                        <View style={styles.taglineContainer}>
                            <View style={styles.taglineLine} />
                            <Text style={styles.tagline}>Premium Plant Store</Text>
                            <View style={styles.taglineLine} />
                        </View>
                    </Animated.View>
                </View>

                <Animated.View style={[styles.bottomSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.description}>
                        Discover the finest collection of indoor & outdoor plants.
                        Transform your space into a green paradise.
                    </Text>

                    <Animated.View style={{ transform: [{ scale: pulseAnim }], width: '100%' }}>
                        <TouchableOpacity
                            style={styles.ctaButton}
                            onPress={() => router.push('/(auth)/onboarding')}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.ctaText}>Get Started</Text>
                            <View style={styles.ctaIconCircle}>
                                <Ionicons name="arrow-forward" size={20} color={COLORS.primary} />
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    <View style={styles.footer}>
                        <View style={styles.dotRow}>
                            <View style={[styles.dot, styles.dotActive]} />
                            <View style={styles.dot} />
                            <View style={styles.dot} />
                        </View>
                        <Text style={styles.footerText}>v1.0 · Potea Inc.</Text>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D2B0D' },
    safeArea: {
        flex: 1, justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingBottom: Platform.OS === 'web' ? SPACING.xl : SPACING.sm,
    },
    circle1: {
        position: 'absolute', width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(1, 183, 99, 0.06)', top: -80, right: -100,
    },
    circle2: {
        position: 'absolute', width: 200, height: 200, borderRadius: 100,
        backgroundColor: 'rgba(1, 183, 99, 0.04)', bottom: 100, left: -60,
    },
    circle3: {
        position: 'absolute', width: 140, height: 140, borderRadius: 70,
        backgroundColor: 'rgba(1, 183, 99, 0.08)', top: '40%', right: 30,
    },
    topSection: { alignItems: 'center', paddingTop: SPACING.xxl },
    logoCircle: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: 'rgba(1, 183, 99, 0.2)', borderWidth: 2,
        borderColor: 'rgba(1, 183, 99, 0.4)', alignItems: 'center', justifyContent: 'center',
    },
    middleSection: { alignItems: 'center', justifyContent: 'center' },
    welcomeLabel: {
        fontSize: 14, fontWeight: '700', letterSpacing: 6,
        color: 'rgba(1, 183, 99, 0.7)', textAlign: 'center', marginBottom: SPACING.sm,
    },
    brandName: {
        fontSize: 72, fontWeight: '800', color: '#FFFFFF',
        textAlign: 'center', letterSpacing: -1,
    },
    taglineContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        marginTop: SPACING.md, gap: SPACING.md,
    },
    taglineLine: { width: 32, height: 1, backgroundColor: 'rgba(1, 183, 99, 0.4)' },
    tagline: {
        fontSize: 14, fontWeight: '500', color: 'rgba(255, 255, 255, 0.6)',
        letterSpacing: 2, textTransform: 'uppercase',
    },
    bottomSection: { alignItems: 'center', paddingBottom: SPACING.lg },
    description: {
        fontSize: 16, color: 'rgba(255, 255, 255, 0.55)',
        textAlign: 'center', lineHeight: 26, marginBottom: SPACING.xl, maxWidth: 340,
    },
    ctaButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: COLORS.primary, height: 60, borderRadius: 30,
        paddingHorizontal: SPACING.lg, width: '100%', maxWidth: 360,
        alignSelf: 'center', gap: SPACING.sm,
    },
    ctaText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    ctaIconCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center',
    },
    footer: { alignItems: 'center', marginTop: SPACING.xl, gap: SPACING.sm },
    dotRow: { flexDirection: 'row', gap: 6 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    dotActive: { backgroundColor: COLORS.primary, width: 20 },
    footerText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.25)', letterSpacing: 1 },
});
