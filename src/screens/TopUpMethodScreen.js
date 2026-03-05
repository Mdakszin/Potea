import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

const METHODS = [
    { id: 'paypal', label: 'PayPal', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' },
    { id: 'google', label: 'Google Pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/512px-Google_Pay_Logo_%282020%29.svg.png' },
    { id: 'apple', label: 'Apple Pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/512px-Apple_Pay_logo.svg.png' },
    { id: 'card', label: '•••• •••• •••• 4679', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png' },
];

export default function TopUpMethodScreen({ route, navigation }) {
    const { amount } = route.params;
    const [selected, setSelected] = useState('paypal');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Top Up E-Wallet</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Select the top up method you want to use</Text>

                {METHODS.map(m => (
                    <TouchableOpacity
                        key={m.id}
                        style={[styles.methodItem, selected === m.id && styles.methodActive]}
                        onPress={() => setSelected(m.id)}
                    >
                        <View style={styles.methodLeft}>
                            <Image source={{ uri: m.icon }} style={styles.methodIcon} resizeMode="contain" />
                            <Text style={styles.methodLabel}>{m.label}</Text>
                        </View>
                        <View style={[styles.radio, selected === m.id && styles.radioActive]}>
                            {selected === m.id && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                ))}

                <Button
                    variant="outline"
                    title="Add New Card"
                    onPress={() => { }}
                    style={styles.addBtn}
                />
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    title="Continue"
                    onPress={() => navigation.navigate('WalletPin', { amount, method: selected })}
                    style={styles.continueBtn}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    headerTitle: { ...TYPOGRAPHY.h3 },
    content: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
    label: { ...TYPOGRAPHY.body, color: COLORS.textLight, marginVertical: SPACING.xl },
    methodItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: SPACING.lg, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border,
        backgroundColor: COLORS.white, marginBottom: SPACING.md,
    },
    methodActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight + '20' },
    methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    methodIcon: { width: 40, height: 24 },
    methodLabel: { ...TYPOGRAPHY.body, fontWeight: '700' },
    radio: {
        width: 20, height: 20, borderRadius: 10,
        borderWidth: 2, borderColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    radioActive: { borderColor: COLORS.primary },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
    addBtn: { borderRadius: 30, marginTop: SPACING.md },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, paddingTop: SPACING.md,
        backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
    },
    continueBtn: { borderRadius: 30 },
});
