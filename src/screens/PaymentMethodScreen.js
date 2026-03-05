import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

const PAYMENT_METHODS = [
    { id: '1', type: 'paypal', label: 'PayPal', sub: 'andrew_ainsley@yourdomain.com', icon: 'logo-paypal', color: '#003087' },
    { id: '2', type: 'apple', label: 'Apple Pay', sub: 'andrew_ainsley@icloud.com', icon: 'logo-apple', color: '#000000' },
    { id: '3', type: 'google', label: 'Google Pay', sub: 'andrew_ainsley@gmail.com', icon: 'logo-google', color: '#4285F4' },
    { id: '4', type: 'card', label: 'Credit / Debit Card', sub: '**** **** **** 4589', icon: 'card-outline', color: COLORS.primary },
];

export default function PaymentMethodScreen({ navigation }) {
    const [selected, setSelected] = useState('4');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Payment Method</Text>
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
                            style={[styles.card, isSelected && styles.cardSelected]}
                            onPress={() => setSelected(item.id)}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: item.color + '20' }]}>
                                <Ionicons name={item.icon} size={24} color={item.color} />
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardLabel}>{item.label}</Text>
                                <Text style={styles.cardSub}>{item.sub}</Text>
                            </View>
                            <View style={[styles.radioOuter, isSelected && styles.radioSelected]}>
                                {isSelected && <View style={styles.radioInner} />}
                            </View>
                        </TouchableOpacity>
                    );
                }}
                ListFooterComponent={
                    <TouchableOpacity style={styles.addNew}>
                        <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.addNewText}>Add New Payment Method</Text>
                    </TouchableOpacity>
                }
            />

            <View style={styles.footer}>
                <Button title="Continue" onPress={() => navigation.goBack()} style={styles.continueBtn} />
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
    list: { paddingHorizontal: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xxl },
    card: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        padding: SPACING.md, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border,
    },
    cardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight + '20' },
    iconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    cardContent: { flex: 1 },
    cardLabel: { ...TYPOGRAPHY.body, fontWeight: '700', marginBottom: 2 },
    cardSub: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight },
    radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
    radioSelected: { borderColor: COLORS.primary },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
    addNew: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.md },
    addNewText: { ...TYPOGRAPHY.body, color: COLORS.primary, fontWeight: '600' },
    footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    continueBtn: { borderRadius: 30 },
});
