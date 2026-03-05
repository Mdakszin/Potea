import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function LetsYouInScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
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
                        title="Continue with Facebook"
                        style={styles.socialButton}
                        icon={<Ionicons name="logo-facebook" size={24} color="#1877F2" />}
                    />
                    <Button
                        variant="social"
                        title="Continue with Google"
                        style={styles.socialButton}
                        icon={<Image source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png' }} style={{ width: 24, height: 24 }} />}
                    />
                    <Button
                        variant="social"
                        title="Continue with Apple"
                        style={styles.socialButton}
                        icon={<Ionicons name="logo-apple" size={24} color={COLORS.text} />}
                    />
                </View>

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <Text style={styles.dividerText}>or</Text>
                    <View style={styles.divider} />
                </View>

                <Button
                    title="Sign in with password"
                    onPress={() => navigation.navigate('SignIn')}
                    style={styles.passwordButton}
                />

                <View style={styles.footerContainer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                        <Text style={styles.footerLink}> Sign up</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
    },
    imageContainer: {
        height: 180,
        width: '100%',
        marginVertical: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    title: {
        ...TYPOGRAPHY.h1,
        marginBottom: SPACING.xl,
        textAlign: 'center',
    },
    socialButtonsContainer: {
        width: '100%',
    },
    socialButton: {
        marginBottom: SPACING.md,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: SPACING.lg,
        width: '100%',
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },
    dividerText: {
        ...TYPOGRAPHY.h3,
        color: COLORS.textLight,
        paddingHorizontal: SPACING.md,
    },
    passwordButton: {
        marginBottom: SPACING.xl,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACING.lg,
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
