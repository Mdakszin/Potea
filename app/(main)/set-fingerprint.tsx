import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function SetFingerprintScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);

    const handleContinue = () => {
        setModalVisible(true);
        setTimeout(() => { setModalVisible(false); router.replace('/(tabs)/home'); }, 3000);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Set Your Fingerprint</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.description, { color: colors.text }]}>Add a fingerprint to make your account more secure and faster to login.</Text>
                <View style={styles.iconWrapper}><Ionicons name="finger-print" size={160} color={COLORS.primary} /></View>
                <Text style={[styles.label, { color: colors.text }]}>Please put your finger on the fingerprint scanner.</Text>
            </ScrollView>

            <View style={styles.footer}>
                <Button variant="outline" title="Skip" onPress={handleContinue} style={styles.skipBtn} />
                <Button title="Continue" onPress={handleContinue} style={styles.continueBtn} />
            </View>

            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
                        <View style={styles.successIcon}><Ionicons name="person" size={70} color={COLORS.white} /></View>
                        <Text style={[styles.modalTitle, { color: COLORS.primary }]}>Congratulations!</Text>
                        <Text style={[styles.modalSubtitle, { color: colors.text }]}>Your account is ready to use. You will be redirected to the Home page in a few seconds.</Text>
                        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
    title: { fontSize: 24, fontWeight: '700' },
    content: { flex: 1, padding: SPACING.lg, alignItems: 'center' },
    description: { textAlign: 'center', fontSize: 16, marginTop: 24, lineHeight: 24 },
    iconWrapper: { marginVertical: 60 },
    label: { textAlign: 'center', fontSize: 16 },
    footer: { flexDirection: 'row', padding: SPACING.lg, gap: 16 },
    skipBtn: { flex: 1 },
    continueBtn: { flex: 1 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalCard: { width: '100%', borderRadius: 40, padding: 32, alignItems: 'center' },
    successIcon: { width: 140, height: 140, borderRadius: 70, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
    modalSubtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
    loader: { marginTop: 24 },
});
