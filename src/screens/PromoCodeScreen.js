import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

const PROMOS = [
    { id: '1', code: 'POTEA20', desc: '20% off your first order', discount: '20%', expiry: 'Dec 31, 2026', used: false },
    { id: '2', code: 'FREESHIP', desc: 'Free shipping on orders above $10', discount: 'Free Ship', expiry: 'Jun 30, 2026', used: false },
    { id: '3', code: 'PLANT10', desc: '10% off on indoor plants', discount: '10%', expiry: 'Mar 31, 2026', used: true },
];

export default function PromoCodeScreen({ navigation }) {
    const [code, setCode] = useState('');
    const [applied, setApplied] = useState(null);

    const handleApply = () => {
        const match = PROMOS.find(p => p.code === code.toUpperCase() && !p.used);
        if (match) setApplied(match);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Promo Code</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Input */}
            <View style={styles.inputSection}>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter promo code"
                        placeholderTextColor={COLORS.textLight}
                        value={code}
                        onChangeText={setCode}
                        autoCapitalize="characters"
                    />
                    <TouchableOpacity style={styles.applyInlineBtn} onPress={handleApply}>
                        <Text style={styles.applyInlineText}>Apply</Text>
                    </TouchableOpacity>
                </View>
                {applied && (
                    <View style={styles.appliedBanner}>
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                        <Text style={styles.appliedText}>"{applied.code}" applied! You save {applied.discount}</Text>
                    </View>
                )}
            </View>

            <Text style={styles.availableTitle}>Available Promos</Text>

            <FlatList
                data={PROMOS}
                keyExtractor={p => p.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => {
                    const isApplied = applied?.id === item.id;
                    return (
                        <View style={[styles.promoCard, item.used && styles.usedCard]}>
                            <View style={styles.promoLeft}>
                                <View style={styles.tagCircle}>
                                    <Ionicons name="pricetag" size={20} color={item.used ? COLORS.textLight : COLORS.primary} />
                                </View>
                                <View>
                                    <Text style={[styles.promoCode, item.used && styles.usedText]}>{item.code}</Text>
                                    <Text style={styles.promoDesc} numberOfLines={1}>{item.desc}</Text>
                                    <Text style={styles.promoExpiry}>Expires {item.expiry}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[styles.useBtn, (item.used || isApplied) && styles.usedBtn]}
                                onPress={() => !item.used && setCode(item.code)}
                                disabled={item.used}
                            >
                                {isApplied
                                    ? <Ionicons name="checkmark" size={16} color={COLORS.primary} />
                                    : <Text style={[styles.useBtnText, item.used && styles.usedBtnText]}>{item.used ? 'Used' : 'Use'}</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />

            <View style={styles.footer}>
                <Button title="Apply Promo" onPress={() => navigation.goBack()} style={styles.applyBtn} />
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
    inputSection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
    inputRow: {
        flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border,
        borderRadius: 12, paddingLeft: SPACING.md, overflow: 'hidden', marginBottom: SPACING.sm,
    },
    input: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.text, height: 48 },
    applyInlineBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, height: 48, alignItems: 'center', justifyContent: 'center' },
    applyInlineText: { color: COLORS.white, fontWeight: '700' },
    appliedBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primaryLight, padding: SPACING.sm, borderRadius: 8 },
    appliedText: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: '600', flex: 1 },
    availableTitle: { ...TYPOGRAPHY.h3, paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
    list: { paddingHorizontal: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xxl },
    promoCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: SPACING.md, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.border,
    },
    usedCard: { opacity: 0.5 },
    promoLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
    tagCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
    promoCode: { ...TYPOGRAPHY.body, fontWeight: '700', color: COLORS.primary },
    usedText: { color: COLORS.textLight },
    promoDesc: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, maxWidth: 200 },
    promoExpiry: { fontSize: 10, color: COLORS.textLight },
    useBtn: {
        borderWidth: 1.5, borderColor: COLORS.primary, borderRadius: 20,
        paddingVertical: 6, paddingHorizontal: 16,
    },
    usedBtn: { borderColor: COLORS.border },
    useBtnText: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: '600' },
    usedBtnText: { color: COLORS.textLight },
    footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    applyBtn: { borderRadius: 30 },
});
