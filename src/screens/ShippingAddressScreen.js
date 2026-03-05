import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

const ADDRESSES = [
    { id: '1', name: 'Andrew Ainsley', address: '3456 Maple Drive', city: 'Springfield, IL 62704', country: 'USA', isDefault: true },
    { id: '2', name: 'Andrew Ainsley', address: '789 Oak Street, Apt 4B', city: 'Chicago, IL 60601', country: 'USA', isDefault: false },
    { id: '3', name: 'Andrew Ainsley', address: '12 Elm Court', city: 'Naperville, IL 60540', country: 'USA', isDefault: false },
];

export default function ShippingAddressScreen({ navigation }) {
    const [selected, setSelected] = useState('1');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Shipping Address</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={ADDRESSES}
                keyExtractor={a => a.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.card, selected === item.id && styles.cardSelected]}
                        onPress={() => setSelected(item.id)}
                    >
                        <View style={styles.radioOuter}>
                            {selected === item.id && <View style={styles.radioInner} />}
                        </View>
                        <View style={styles.cardContent}>
                            <View style={styles.cardRow}>
                                <Text style={styles.cardName}>{item.name}</Text>
                                {item.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>}
                            </View>
                            <Text style={styles.cardAddress}>{item.address}</Text>
                            <Text style={styles.cardAddress}>{item.city}, {item.country}</Text>
                        </View>
                        <TouchableOpacity style={styles.editBtn}>
                            <Ionicons name="pencil-outline" size={16} color={COLORS.primary} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
                ListFooterComponent={
                    <TouchableOpacity style={styles.addNewBtn}>
                        <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                        <Text style={styles.addNewText}>Add New Address</Text>
                    </TouchableOpacity>
                }
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
        flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
        padding: SPACING.md, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border,
    },
    cardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight + '20' },
    radioOuter: {
        width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center', marginTop: 2,
    },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
    cardContent: { flex: 1 },
    cardRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: 4 },
    cardName: { ...TYPOGRAPHY.body, fontWeight: '700' },
    defaultBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
    defaultText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },
    cardAddress: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, lineHeight: 20 },
    editBtn: { padding: 4 },
    addNewBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.md },
    addNewText: { ...TYPOGRAPHY.body, color: COLORS.primary, fontWeight: '600' },
    footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    applyBtn: { borderRadius: 30 },
});
