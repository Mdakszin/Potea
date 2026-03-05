import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import TextField from '../components/TextField';
import Checkbox from '../components/Checkbox';
import { Ionicons } from '@expo/vector-icons';

export default function SignUpScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.logoContainer}>
                    <Ionicons name="leaf" size={60} color={COLORS.primary} style={styles.logo} />
                </View>

                <Text style={styles.title}>Create Your Account</Text>

                <View style={styles.formContainer}>
                    <TextField
                        icon="mail"
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        keyboardType="email-address"
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

                    <Button
                        title="Sign up"
                        onPress={() => {
                            console.log('Sign up', { email, password });
                            navigation.navigate('FillProfile');
                        }}
                        style={styles.signUpButton}
                    />
                </View>

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.divider} />
                </View>

                <View style={styles.socialButtonsRow}>
                    <TouchableOpacity style={styles.socialIconBtn}>
                        <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialIconBtn}>
                        <Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png' }} style={{ width: 24, height: 24 }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.socialIconBtn}>
                        <Ionicons name="logo-apple" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Already have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                        <Text style={styles.footerLink}> Sign in</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl,
        alignItems: 'center',
    },
    logoContainer: {
        marginTop: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    logo: {
        alignSelf: 'center',
    },
    title: {
        ...TYPOGRAPHY.h2,
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
    },
    input: {
        marginBottom: SPACING.lg,
    },
    rememberRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
    },
    signUpButton: {
        marginBottom: SPACING.xl,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.xl,
        width: '100%'
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textLight,
        paddingHorizontal: SPACING.md,
    },
    socialButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.xl,
        marginBottom: SPACING.xxl,
    },
    socialIconBtn: {
        width: 60,
        height: 60,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
    },
    footerText: {
        ...TYPOGRAPHY.bodySmall,
    },
    footerLink: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.primary,
        fontWeight: '600',
    }
});
