import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import useCheckoutStore from '../../src/store/useCheckoutStore';

interface PaymentMethod {
    id: string;
    method: 'wallet' | 'paypal' | 'apple' | 'google' | 'card';
    label: string;
    sub: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

export default function PaymentMethodScreen() {
    const { colors, isDark } = useTheme();
    const { userData } = useAuth();
    const router = useRouter();
    const { selectedPayment, setSelectedPayment } = useCheckoutStore();
    const [selected, setSelected] = useState(selectedPayment?.id || 'wallet');

    const balance = userData?.balance || 0;

    const PAYMENT_METHODS: PaymentMethod[] = [
        { id: 'wallet', method: 'wallet', label: 'Potea E-Wallet', sub: `$${balance.toLocaleString()}`, icon: 'wallet-outline', color: COLORS.primary },
        { id: '1', method: 'paypal', label: 'PayPal', sub: 'andrew_ainsley@yourdomain.com', icon: 'logo-paypal', color: '#003087' },
        { id: '2', method: 'apple', label: 'Apple Pay', sub: 'andrew_ainsley@icloud.com', icon: 'logo-apple', color: '#000000' },
        { id: '3', method: 'google', label: 'Google Pay', sub: 'andrew_ainsley@gmail.com', icon: 'logo-google', color: '#4285F4' },
        { id: 'card', method: 'card', label: 'Credit / Debit Card', sub: '**** **** **** 4589', icon: 'card-outline', color: COLORS.primary },
    ];

    const handleContinue = () => {
        const method = PAYMENT_METHODS.find(m => m.id === selected);
        if (method) {
            setSelectedPayment(method);
        }
        router.push('/(main)/checkout');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { borderColor: colors.border }]}>
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Payment Method</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={PAYMENT_METHODS}
                keyExtractor={p => p.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    const isSelected = selected === item.id;
                    return (
                        <TouchableOpacity
                            style={[
                                styles.card,
                                { backgroundColor: colors.card, borderColor: isSelected ? COLORS.primary : colors.border },
                                isSelected && { backgroundColor: isDark ? 'rgba(76, 175, 80, 0.1)' : COLORS.primaryLight + '20' }
                            ]}
                            onPress={() => setSelected(item.id)}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: item.color + (isDark ? '30' : '20') }]}>
                                <Ionicons 
                                    name={item.icon} 
                                    size={24} 
                                    color={item.color === '#000000' && isDark ? '#FFFFFF' : item.color} 
                                />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={[styles.cardLabel, { color: colors.text }]}>{item.label}</Text>
                                <Text style={[styles.cardSub, { color: colors.textLight }]}>{item.sub}</Text>
                            </View>
                            <View style={[styles.radioOuter, { borderColor: isSelected ? COLORS.primary : colors.border }]}>
                                {isSelected && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
            <View style={styles.footer}>
                <Button title="Continue" onPress={handleContinue} style={{ width: '100%' }} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: '700' },
    list: { paddingHorizontal: SPACING.lg, gap: SPACING.md, paddingBottom: 100 },
    card: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: 16, borderWidth: 1.5 },
    iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    cardContent: { flex: 1 },
    cardLabel: { fontSize: 16, fontWeight: '700' },
    cardSub: { fontSize: 12 },
    radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
    footer: { padding: SPACING.lg, position: 'absolute', bottom: 0, left: 0, right: 0 },
});
