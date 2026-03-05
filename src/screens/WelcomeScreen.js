import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen({ navigation }) {
    return (
        <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1497250681554-fc1da9915eb9?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80' }} // Placeholder plant image
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <View style={styles.overlay}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.bottomContent}>
                        <Text style={styles.welcomeText}>Welcome to</Text>
                        <Text style={styles.brandText}>Potea</Text>
                        <Text style={styles.subtitleText}>
                            The best plant e-commerce & online store app of the century for your needs!
                        </Text>

                        {/* The actual design probably has a delayed transition, or we add a button if needed */}
                        <View style={{ marginTop: 20 }}>
                            <Text style={{ color: COLORS.white, textAlign: 'center' }} onPress={() => navigation.navigate('Onboarding')}>Tap to continue...</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)', // Dark overlay to make text readable
        justifyContent: 'flex-end',
    },
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: SPACING.lg,
    },
    bottomContent: {
        marginBottom: SPACING.xl,
    },
    welcomeText: {
        ...TYPOGRAPHY.h1,
        color: COLORS.white,
        marginBottom: SPACING.xs,
    },
    brandText: {
        ...TYPOGRAPHY.h1,
        color: COLORS.primary,
        fontSize: 48, // Make it very large as per design
        marginBottom: SPACING.md,
    },
    subtitleText: {
        ...TYPOGRAPHY.body,
        color: COLORS.white,
        opacity: 0.9,
        lineHeight: 24,
    }
});
