import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

const SHIPPING_OPTIONS = [
    { id: '1', type: 'Economy', icon: 'walk-outline', days: '5–8 days', arrival: 'Mar 14–17', price: 0.99, company: 'LocalPost' },
    { id: '2', type: 'Regular', icon: 'bicycle-outline', days: '3–5 days', arrival: 'Mar 10–12', price: 2.99, company: 'SpeedShip' },
    { id: '3', type: 'Cargo', icon: 'cube-outline', days: '2–3 days', arrival: 'Mar 9–10', price: 5.99, company: 'CargoFast' },
    { id: '4', type: 'Express', icon: 'flash-outline', days: '1–2 days', arrival: 'Mar 8–9', price: 9.99, company: 'ExpressGo' },
];

export default function ChooseShippingScreen({ navigation }) {
    const [selected, setSelected] = useState('2');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Choose Shipping</Text>
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
                            style={[styles.card, isSelected && styles.cardSelected]}
                            onPress={() => setSelected(item.id)}
                        >
                            <View style={[styles.iconCircle, isSelected && styles.iconCircleActive]}>
                                <Ionicons name={item.icon} size={24} color={isSelected ? COLORS.primary : COLORS.textLight} />
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={styles.typeName}>{item.type}</Text>
                                <Text style={styles.company}>{item.company}</Text>
                                <Text style={styles.days}>{item.days}  ·  Est. {item.arrival}</Text>
                            </View>
                            <View style={styles.priceCol}>
                                <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                                <View style={[styles.radioOuter, isSelected && styles.radioSelected]}>
                                    {isSelected && <View style={styles.radioInner} />}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            <View style={styles.footer}>
                <Button title="Apply" onPress={() => navigation.goBack()} style={styles.applyBtn} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.md,
    },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
    title: { ...TYPOGRAPHY.h2 },
    list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, gap: SPACING.md },
    card: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        padding: SPACING.md, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border,
    },
    cardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight + '20' },
    iconCircle: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
    },
    iconCircleActive: { backgroundColor: COLORS.primaryLight },
    cardInfo: { flex: 1 },
    typeName: { ...TYPOGRAPHY.body, fontWeight: '700', marginBottom: 2 },
    company: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight },
    days: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: '600' },
    priceCol: { alignItems: 'center', gap: SPACING.sm },
    price: { ...TYPOGRAPHY.body, fontWeight: '700' },
    radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
    radioSelected: { borderColor: COLORS.primary },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
    footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    applyBtn: { borderRadius: 30 },
});
