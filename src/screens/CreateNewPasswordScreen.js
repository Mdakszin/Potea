import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import TextField from '../components/TextField';
import Checkbox from '../components/Checkbox';
import { Ionicons } from '@expo/vector-icons';

// Reuse the same Congratulations modal pattern
const SuccessModal = ({ visible }) => (
    <Modal transparent visible={visible} animationType="fade">
        <View style={modalStyles.overlay}>
            <View style={modalStyles.card}>
                <View style={modalStyles.iconCircle}>
                    <Ionicons name="shield-checkmark" size={80} color={COLORS.white} />
                </View>
                <Text style={modalStyles.title}>Congratulations!</Text>
                <Text style={modalStyles.body}>
                    Your account is ready to use. You will be redirected to the Home page in a few seconds.
                </Text>
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
            </View>
        </View>
    </Modal>
);

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.xl,
    },
    card: {
        backgroundColor: COLORS.white, borderRadius: 40,
        padding: SPACING.xl, alignItems: 'center', width: '100%',
    },
    iconCircle: {
        width: 140, height: 140, borderRadius: 70,
        backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
        marginBottom: SPACING.xl, marginTop: SPACING.md,
    },
    title: { ...TYPOGRAPHY.h2, color: COLORS.primary, textAlign: 'center', marginBottom: SPACING.md },
    body: { ...TYPOGRAPHY.body, textAlign: 'center', lineHeight: 24 },
});

export default function CreateNewPasswordScreen({ navigation }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const handleContinue = () => {
        setModalVisible(true);
        setTimeout(() => {
            setModalVisible(false);
            // Navigate to Sign In on success
            navigation.navigate('SignIn');
        }, 3000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create New Password</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Illustration */}
                <View style={styles.illustrationContainer}>
                    <View style={styles.illustrationBg}>
                        <Ionicons name="lock-open-outline" size={100} color={COLORS.primary} style={styles.lockIcon} />
                        <View style={styles.shieldBadge}>
                            <Ionicons name="shield-checkmark" size={44} color={COLORS.white} />
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionLabel}>Create Your New Password</Text>

                <TextField
                    icon="lock-closed"
                    placeholder="New Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                />
                <TextField
                    icon="lock-closed"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    style={styles.input}
                />

                <Checkbox label="Remember me" checked={rememberMe} onChange={setRememberMe} />

                <Button
                    title="Continue"
                    onPress={handleContinue}
                    style={styles.continueButton}
                />
            </ScrollView>

            <SuccessModal visible={modalVisible} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
    },
    backButton: { paddingRight: SPACING.md },
    headerTitle: { ...TYPOGRAPHY.h3 },
    content: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
    illustrationContainer: {
        alignItems: 'center', justifyContent: 'center',
        marginVertical: SPACING.xl,
    },
    illustrationBg: {
        width: 240, height: 240,
        backgroundColor: COLORS.primaryLight,
        borderRadius: 120,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    lockIcon: { opacity: 0.8 },
    shieldBadge: {
        position: 'absolute',
        bottom: 20, right: 10,
        backgroundColor: COLORS.primary,
        width: 70, height: 70, borderRadius: 35,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 4, borderColor: COLORS.white,
        elevation: 10, shadowColor: COLORS.primary, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    },
    sectionLabel: { ...TYPOGRAPHY.body, color: COLORS.text, fontWeight: '500', marginBottom: SPACING.lg, marginTop: SPACING.md },
    input: { marginBottom: SPACING.lg },
    continueButton: { marginTop: 'auto', marginBottom: SPACING.xl },
});
