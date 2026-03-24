import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Method {
    id: string;
    label: string;
    icon: string;
}

const METHODS: Method[] = [
    { id: 'paypal', label: 'PayPal', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' },
    { id: 'google', label: 'Google Pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo_%282020%29.svg/512px-Google_Pay_Logo_%282020%29.svg.png' },
    { id: 'apple', label: 'Apple Pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Apple_Pay_logo.svg/512px-Apple_Pay_logo.svg.png' },
    { id: 'card', label: '•••• •••• •••• 4679', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png' },
];

export default function TopUpMethodScreen() {
    const { amount } = useLocalSearchParams();
    const { colors } = useTheme();
    const router = useRouter();
    const [selected, setSelected] = useState('paypal');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Top Up E-Wallet</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.label, { color: colors.textLight }]}>Select the top up method you want to use</Text>
                {METHODS.map(m => (
                    <TouchableOpacity 
                        key={m.id} 
                        style={[
                            styles.methodItem, 
                            { 
                                backgroundColor: colors.card, 
                                borderColor: selected === m.id ? COLORS.primary : colors.border 
                            }, 
                            selected === m.id && styles.methodActive
                        ]} 
                        onPress={() => setSelected(m.id)}
                    >
                        <View style={styles.methodLeft}>
                            <Image source={{ uri: m.icon }} style={styles.methodIcon} resizeMode="contain" />
                            <Text style={[styles.methodLabel, { color: colors.text }]}>{m.label}</Text>
                        </View>
                        <View style={[styles.radio, { borderColor: COLORS.primary }]}>
                            {selected === m.id && <View style={styles.radioInner} />}
                        </View>
                    </TouchableOpacity>
                ))}
                <Button variant="outline" title="Add New Card" style={styles.addBtn} />
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <Button 
                    title="Continue" 
                    onPress={() => router.push({ pathname: '/(main)/wallet-pin', params: { amount, method: selected } })} 
                    style={styles.continueBtn} 
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    headerTitle: { fontSize: 24, fontWeight: '700' },
    content: { paddingHorizontal: SPACING.lg, paddingBottom: 120 },
    label: { fontSize: 16, marginVertical: SPACING.xl },
    methodItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg, borderRadius: 20, borderWidth: 1.5, marginBottom: SPACING.md },
    methodActive: { backgroundColor: COLORS.primary + '10' },
    methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    methodIcon: { width: 40, height: 24 },
    methodLabel: { fontSize: 16, fontWeight: '700' },
    radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
    addBtn: { borderRadius: 30, marginTop: SPACING.md },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, paddingTop: SPACING.md, borderTopWidth: 1 },
    continueBtn: { width: '100%' },
});
