import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';

const SHIPPING_OPTIONS = [
    { id: '1', type: 'Economy', icon: 'walk-outline', days: '5–8 days', arrival: 'Mar 14–17', price: 0.99, company: 'LocalPost' },
    { id: '2', type: 'Regular', icon: 'bicycle-outline', days: '3–5 days', arrival: 'Mar 10–12', price: 2.99, company: 'SpeedShip' },
    { id: '3', type: 'Cargo', icon: 'cube-outline', days: '2–3 days', arrival: 'Mar 9–10', price: 5.99, company: 'CargoFast' },
    { id: '4', type: 'Express', icon: 'flash-outline', days: '1–2 days', arrival: 'Mar 8–9', price: 9.99, company: 'ExpressGo' },
];

export default function ChooseShippingScreen() {
    const { colors } = useTheme();
    const [selected, setSelected] = useState('2');
    const router = useRouter();

    const handleApply = () => {
        const selectedOption = SHIPPING_OPTIONS.find(s => s.id === selected);
        router.push({ pathname: '/(main)/checkout', params: { selectedShipping: JSON.stringify(selectedOption) } });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Choose Shipping</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={SHIPPING_OPTIONS}
                keyExtractor={s => s.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    const isSelected = selected === item.id;
                    return (
                        <TouchableOpacity
                            style={[styles.card, { borderColor: isSelected ? COLORS.primary : colors.border, backgroundColor: isSelected ? COLORS.primary + '10' : colors.card }]}
                            onPress={() => setSelected(item.id)}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: isSelected ? COLORS.primaryLight : colors.background }]}>
                                <Ionicons name={item.icon} size={24} color={isSelected ? COLORS.primary : colors.textLight} />
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={[styles.typeName, { color: colors.text }]}>{item.type}</Text>
                                <Text style={[styles.company, { color: colors.textLight }]}>{item.company}</Text>
                                <Text style={styles.days}>{item.days}  ·  Est. {item.arrival}</Text>
                            </View>
                            <View style={styles.priceCol}>
                                <Text style={[styles.price, { color: colors.text }]}>${item.price.toFixed(2)}</Text>
                                <View style={[styles.radioOuter, { borderColor: isSelected ? COLORS.primary : colors.border }]}>
                                    {isSelected && <View style={styles.radioInner} />}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            <View style={styles.footer}><Button title="Apply" onPress={handleApply} style={{ width: '100%' }} /></View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: '700' },
    list: { paddingHorizontal: SPACING.lg, paddingBottom: 100, gap: SPACING.md },
    card: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md, borderRadius: 16, borderWidth: 1.5 },
    iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    cardInfo: { flex: 1 },
    typeName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    company: { fontSize: 12 },
    days: { fontSize: 12, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
    priceCol: { alignItems: 'center', gap: SPACING.sm },
    price: { fontSize: 16, fontWeight: '700' },
    radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
    footer: { padding: SPACING.lg, position: 'absolute', bottom: 0, left: 0, right: 0 },
});
