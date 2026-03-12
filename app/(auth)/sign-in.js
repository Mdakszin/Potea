import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../src/components/Button';
import TextField from '../../src/components/TextField';
import Checkbox from '../../src/components/Checkbox';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';

const googleLogo = require('../../assets/google-logo.png');

export default function SignInScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const { login, loginWithGoogle } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSignIn = async () => {
        if (!email || !password) {
            setError('Please enter your email and password');
            return;
        }

        try {
            setError(null);
            setLoading(true);
            await login(email, password);
            // On success, App root redirects automatically or we can replace manually
            router.replace('/(main)/(tabs)/home');
        } catch (err) {
            console.error(err);
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.logoContainer}>
                    <Ionicons name="leaf" size={60} color={COLORS.primary} style={styles.logo} />
                </View>

                <Text style={styles.title}>Login to Your Account</Text>

                <View style={styles.formContainer}>
                    <TextField
                        icon="mail"
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <TextField
                        icon="lock-closed"
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                    />

                    <View style={styles.rememberRow}>
                        <Checkbox
                            label="Remember me"
                            checked={rememberMe}
                            onChange={setRememberMe}
                        />
                    </View>

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <Button
                        title={loading ? "Signing in..." : "Sign in"}
                        onPress={handleSignIn}
                        style={styles.signInButton}
                        disabled={loading}
                    />

                    <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                        <Text style={styles.forgotPassword}>Forgot the password?</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.divider} />
                </View>

                <View style={styles.socialButtonsRow}>
                    <TouchableOpacity style={styles.socialIconBtn} onPress={async () => {
                        try {
                            await loginWithGoogle();
                            router.replace('/(main)/(tabs)/home');
                        } catch (err) {
                            Alert.alert('Google Sign-In Failed', err.message || 'Please try again.');
                        }
                    }}>
                        <Image source={googleLogo} style={{ width: 24, height: 24 }} />
                    </TouchableOpacity>
                </View>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                        <Text style={styles.footerLink}> Sign up</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm },
    scrollContent: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, alignItems: 'center' },
    logoContainer: { marginTop: SPACING.xl, marginBottom: SPACING.xl },
    logo: { alignSelf: 'center' },
    title: { ...TYPOGRAPHY.h2, marginBottom: SPACING.xl, textAlign: 'center' },
    formContainer: { width: '100%' },
    input: { marginBottom: SPACING.lg },
    rememberRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: SPACING.lg },
    signInButton: { marginBottom: SPACING.lg },
    forgotPassword: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: '600', textAlign: 'center', marginBottom: SPACING.xl },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl, width: '100%' },
    divider: { flex: 1, height: 1, backgroundColor: COLORS.border },
    dividerText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, paddingHorizontal: SPACING.md },
    socialButtonsRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.xl, marginBottom: SPACING.xxl },
    socialIconBtn: { width: 60, height: 60, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
    footerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto' },
    footerText: { ...TYPOGRAPHY.bodySmall },
    footerLink: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: '600' },
    errorText: { color: COLORS.error, ...TYPOGRAPHY.bodySmall, textAlign: 'center', marginBottom: SPACING.md },
});
