import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

const PRESETS = [10, 20, 50, 100, 200, 250, 500, 750, 1000];

const Numpad = ({ onPressKey, onDelete }) => {
    const rows = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'delete']];
    return (
        <View style={numpadStyles.container}>
            {rows.map((row, ri) => (
                <View key={ri} style={numpadStyles.row}>
                    {row.map((key, ci) => (
                        <TouchableOpacity
                            key={ci} disabled={key === ''}
                            style={numpadStyles.key}
                            onPress={() => key === 'delete' ? onDelete() : key && onPressKey(key)}
                        >
                            {key === 'delete'
                                ? <Ionicons name="backspace-outline" size={28} color={COLORS.text} />
                                : <Text style={numpadStyles.keyText}>{key}</Text>}
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
};

const numpadStyles = StyleSheet.create({
    container: { width: '100%', marginTop: SPACING.lg },
    row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md },
    key: { width: 70, height: 50, alignItems: 'center', justifyContent: 'center' },
    keyText: { fontSize: 28, fontWeight: '500', color: COLORS.text },
});

export default function TopUpWalletScreen({ navigation }) {
    const [amount, setAmount] = useState('100');

    const handleKey = (key) => setAmount(prev => (prev === '0' ? key : prev + key));
    const handleDelete = () => setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Top Up E-Wallet</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.label}>Enter the amount of top up</Text>

                <View style={styles.amountContainer}>
                    <Text style={styles.currency}>$</Text>
                    <Text style={styles.amountText}>{amount}</Text>
                </View>

                {/* Presets */}
                <View style={styles.presetsGrid}>
                    {PRESETS.map(p => (
                        <TouchableOpacity
                            key={p}
                            style={[styles.presetItem, amount === String(p) && styles.presetActive]}
                            onPress={() => setAmount(String(p))}
                        >
                            <Text style={[styles.presetText, amount === String(p) && styles.presetTextActive]}>${p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Button
                    title="Continue"
                    onPress={() => navigation.navigate('TopUpMethod', { amount: Number(amount) })}
                    style={styles.continueBtn}
                />

                <Numpad onPressKey={handleKey} onDelete={handleDelete} />
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
    content: { flex: 1, paddingHorizontal: SPACING.lg, alignItems: 'center' },
    label: { ...TYPOGRAPHY.body, color: COLORS.textLight, marginTop: SPACING.xl, marginBottom: SPACING.xl },
    amountContainer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: COLORS.primary, borderRadius: 24,
        paddingVertical: 16, paddingHorizontal: 40, width: '100%',
        marginBottom: SPACING.xl,
    },
    currency: { ...TYPOGRAPHY.h1, color: COLORS.primary, fontSize: 32, marginRight: 8 },
    amountText: { ...TYPOGRAPHY.h1, color: COLORS.primary, fontSize: 32 },
    presetsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: SPACING.xl },
    presetItem: {
        width: '30%', height: 40, borderRadius: 20,
        borderWidth: 1.5, borderColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    presetActive: { backgroundColor: COLORS.primary },
    presetText: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: '700' },
    presetTextActive: { color: COLORS.white },
    continueBtn: { width: '100%', borderRadius: 30 },
});
