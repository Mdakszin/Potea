import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

const googleLogo = require('../../assets/google-logo.png');

export default function LetsYouInScreen() {
    const { loginWithGoogle } = useAuth();
    const router = useRouter();
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        try {
            setGoogleLoading(true);
            await loginWithGoogle();
            // Redirect happens in AuthContext or app root index.js
        } catch (err) {
            Alert.alert('Google Sign-In Failed', err.message || 'Please try again.');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <Text style={styles.title}>Let's you in</Text>

                <View style={styles.socialButtonsContainer}>
                    <Button
                        variant="social"
                        title={googleLoading ? "Signing in..." : "Continue with Google"}
                        style={styles.socialButton}
                        onPress={handleGoogleSignIn}
                        disabled={googleLoading}
                        icon={<Image source={googleLogo} style={{ width: 24, height: 24 }} />}
                    />
                </View>

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.divider} />
                </View>

                <Button
                    title="Sign in with password"
                    onPress={() => router.push('/(auth)/sign-in')}
                    style={styles.passwordButton}
                />

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                        <Text style={styles.footerLink}> Sign up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
    content: { flex: 1, paddingHorizontal: SPACING.lg, alignItems: 'center' },
    imageContainer: {
        height: 180, width: '100%', marginVertical: SPACING.xl,
        alignItems: 'center', justifyContent: 'center',
    },
    image: { width: '80%', height: '100%' },
    title: { ...TYPOGRAPHY.h1, marginBottom: SPACING.xl, color: COLORS.text, textAlign: 'center' },
    socialButtonsContainer: { width: '100%', gap: SPACING.md, marginBottom: SPACING.lg },
    socialButton: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.xl, width: '100%' },
    divider: { flex: 1, height: 1, backgroundColor: COLORS.border },
    dividerText: { marginHorizontal: SPACING.md, ...TYPOGRAPHY.body, color: COLORS.textLight },
    passwordButton: { width: '100%', marginBottom: SPACING.xl },
    footerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 'auto', marginBottom: SPACING.xl },
    footerText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight },
    footerLink: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: '700' },
});
