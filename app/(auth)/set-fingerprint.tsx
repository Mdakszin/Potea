import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface SuccessModalProps {
    visible: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ visible }) => (
    <Modal transparent visible={visible} animationType="fade">
        <View style={modalStyles.overlay}>
            <View style={modalStyles.container}>
                <View style={modalStyles.iconCircle}>
                    <Ionicons name="person" size={80} color={COLORS.white} />
                </View>
                <Text style={modalStyles.title}>Congratulations!</Text>
                <Text style={modalStyles.subtitle}>
                    Your account is ready to use. You will be redirected to the Home page in a few seconds.
                </Text>
                <ActivityIndicator size="large" color={COLORS.primary} style={modalStyles.loader} />
            </View>
        </View>
    </Modal>
);

const modalStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl },
    container: { backgroundColor: COLORS.white, borderRadius: 40, padding: SPACING.xl, alignItems: 'center', width: '100%' },
    iconCircle: { width: 140, height: 140, borderRadius: 70, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl, marginTop: SPACING.md },
    title: { ...TYPOGRAPHY.h2, color: COLORS.primary, marginBottom: SPACING.md, textAlign: 'center' },
    subtitle: { ...TYPOGRAPHY.body, textAlign: 'center', color: COLORS.text, lineHeight: 24 },
    loader: { marginTop: SPACING.xl, marginBottom: SPACING.lg }
});

export default function SetFingerprintScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter();

    const handleContinue = () => {
        setModalVisible(true);
        setTimeout(() => {
            setModalVisible(false);
            router.replace('/(main)/(tabs)/home');
        }, 3000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Set Your Fingerprint</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.textContainer}>
                    <Text style={styles.subtitle}>Add a fingerprint to make your account more secure.</Text>
                </View>
                <View style={styles.fingerprintContainer}>
                    <Ionicons name="finger-print-outline" size={200} color={COLORS.primary} />
                </View>
                <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsText}>Please put your finger on the fingerprint scanner to get started.</Text>
                </View>
            </ScrollView>

            <View style={styles.footerContainer}>
                <Button variant="outline" title="Skip" onPress={handleContinue} style={styles.skipButton} />
                <Button title="Continue" onPress={handleContinue} style={styles.continueButton} />
            </View>

            <SuccessModal visible={modalVisible} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.md },
    backButton: { paddingRight: SPACING.md },
    headerTitle: { ...TYPOGRAPHY.h3 },
    scrollContent: { flexGrow: 1, paddingHorizontal: SPACING.lg, alignItems: 'center' },
    textContainer: { marginTop: SPACING.xxl, marginBottom: SPACING.xxl * 2, paddingHorizontal: SPACING.xl },
    subtitle: { ...TYPOGRAPHY.body, textAlign: 'center', lineHeight: 24 },
    fingerprintContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: SPACING.xxl },
    instructionsContainer: { marginTop: SPACING.xxl, paddingHorizontal: SPACING.xl },
    instructionsText: { ...TYPOGRAPHY.body, textAlign: 'center', lineHeight: 24 },
    footerContainer: { flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.xl, gap: SPACING.md },
    skipButton: { flex: 1 },
    continueButton: { flex: 1 },
});
