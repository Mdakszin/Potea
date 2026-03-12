import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const CONTACT_METHODS = [
    {
        id: 'sms',
        icon: 'chatbubble-ellipses-outline',
        label: 'via SMS',
        value: '+1 111 *****99',
        iconBg: '#E8F8EE',
        iconColor: COLORS.primary,
    },
    {
        id: 'email',
        icon: 'mail-outline',
        label: 'via Email',
        value: 'and***iley@yourdomain.com',
        iconBg: '#FFF4E4',
        iconColor: '#FF8900',
    },
];

export default function ForgotPasswordScreen() {
    const [selected, setSelected] = useState('sms');
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Forgot Password</Text>
            </View>

            <View style={styles.illustrationContainer}>
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80' }}
                    style={styles.illustration}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>
                    Select which contact details should we use to reset your password
                </Text>

                <View style={styles.optionsContainer}>
                    {CONTACT_METHODS.map((method) => {
                        const isSelected = selected === method.id;
                        return (
                            <TouchableOpacity
                                key={method.id}
                                style={[styles.optionCard, isSelected && styles.selectedCard]}
                                onPress={() => setSelected(method.id)}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.optionIconCircle, { backgroundColor: method.iconBg }]}>
                                    <Ionicons name={method.icon} size={28} color={method.iconColor} />
                                </View>
                                <View style={styles.optionText}>
                                    <Text style={styles.optionLabel}>{method.label}</Text>
                                    <Text style={styles.optionValue}>{method.value}</Text>
                                </View>
                                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                                    {isSelected && <View style={styles.radioInner} />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Button
                    title="Continue"
                    onPress={() => router.push({ pathname: '/(auth)/otp-verification', params: { method: selected } })}
                    style={styles.continueButton}
                />
            </View>
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
    illustrationContainer: {
        width: '100%', height: 180, alignItems: 'center', justifyContent: 'center',
        marginVertical: SPACING.md,
    },
    illustration: { width: '80%', height: '100%' },
    content: { flex: 1, paddingHorizontal: SPACING.lg },
    subtitle: { ...TYPOGRAPHY.body, lineHeight: 24, marginBottom: SPACING.xl },
    optionsContainer: { gap: SPACING.md, marginBottom: SPACING.xl },
    optionCard: {
        flexDirection: 'row', alignItems: 'center',
        padding: SPACING.lg, borderRadius: 16,
        borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.white,
    },
    selectedCard: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight + '20' },
    optionIconCircle: {
        width: 60, height: 60, borderRadius: 30,
        alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
    },
    optionText: { flex: 1 },
    optionLabel: { ...TYPOGRAPHY.bodySmall, marginBottom: 4 },
    optionValue: { ...TYPOGRAPHY.body, fontWeight: '600' },
    radioOuter: {
        width: 22, height: 22, borderRadius: 11,
        borderWidth: 2, borderColor: COLORS.border,
        alignItems: 'center', justifyContent: 'center',
    },
    radioOuterSelected: { borderColor: COLORS.primary },
    radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
    continueButton: { marginTop: 'auto', marginBottom: SPACING.xl },
});
