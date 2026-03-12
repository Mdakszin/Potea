import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

const PRESETS = [10, 20, 50, 100, 200, 250, 500, 750, 1000];

const Numpad = ({ onPressKey, onDelete, colors }) => {
    const rows = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'delete']];
    return (
        <View style={numpadStyles.container}>
            {rows.map((row, ri) => (
                <View key={ri} style={numpadStyles.row}>
                    {row.map((key, ci) => (
                        <TouchableOpacity key={ci} disabled={key === ''} style={numpadStyles.key} onPress={() => key === 'delete' ? onDelete() : key && onPressKey(key)}>
                            {key === 'delete' ? <Ionicons name="backspace-outline" size={28} color={colors.text} /> : <Text style={[numpadStyles.keyText, { color: colors.text }]}>{key}</Text>}
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
    keyText: { fontSize: 28, fontWeight: '500' },
});

export default function TopUpWalletScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [amount, setAmount] = useState('100');

    const handleKey = (key) => setAmount(prev => (prev === '0' ? key : prev + key));
    const handleDelete = () => setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Top Up E-Wallet</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.label, { color: colors.textLight }]}>Enter the amount of top up</Text>
                <View style={[styles.amountContainer, { borderColor: COLORS.primary }]}>
                    <Text style={styles.currency}>$</Text>
                    <Text style={[styles.amountText, { color: colors.text }]}>{amount}</Text>
                </View>

                <View style={styles.presetsGrid}>
                    {PRESETS.map(p => (
                        <TouchableOpacity key={p} style={[styles.presetItem, amount === String(p) ? styles.presetActive : { borderColor: colors.border }]} onPress={() => setAmount(String(p))}>
                            <Text style={[styles.presetText, amount === String(p) ? styles.presetTextActive : { color: colors.text }]}>${p}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Button title="Continue" onPress={() => router.push({ pathname: '/(main)/top-up-method', params: { amount: Number(amount) } })} style={styles.continueBtn} />
                <Numpad onPressKey={handleKey} onDelete={handleDelete} colors={colors} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    headerTitle: { fontSize: 24, fontWeight: '700' },
    content: { flex: 1, padding: SPACING.lg, alignItems: 'center' },
    label: { fontSize: 16, marginBottom: 24 },
    amountContainer: { width: '100%', height: 100, borderRadius: 24, borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    currency: { fontSize: 32, fontWeight: '700', color: COLORS.text, marginRight: 8 },
    amountText: { fontSize: 48, fontWeight: '800' },
    presetsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
    presetItem: { width: '30%', paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center', marginBottom: 12 },
    presetActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    presetText: { fontSize: 16, fontWeight: '700' },
    presetTextActive: { color: COLORS.white },
    continueBtn: { width: '100%', marginTop: 12 },
});
