import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import { db } from '../../src/config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function PromoCodeScreen() {
    const { colors, isDark } = useTheme();
    const [code, setCode] = useState('');
    const [applied, setApplied] = useState(null);
    const [promos, setPromos] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const q = query(collection(db, 'promos'), where('active', '==', true));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPromos(list);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleApply = (promoToApply = null) => {
        const codeToCheck = promoToApply ? promoToApply.code : code.toUpperCase();
        const match = promos.find(p => p.code === codeToCheck && !p.used);
        if (match) setApplied(match);
        else { Alert.alert("Invalid Code", "Invalid or expired."); setApplied(null); }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Promo Code</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.inputSection}>
                <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    <TextInput style={[styles.input, { color: colors.text }]} placeholder="Enter promo code" placeholderTextColor={colors.textLight} value={code} onChangeText={setCode} autoCapitalize="characters" />
                    <TouchableOpacity style={styles.applyInlineBtn} onPress={() => handleApply()}><Text style={styles.applyInlineText}>Apply</Text></TouchableOpacity>
                </View>
                {applied && (
                    <View style={[styles.appliedBanner, { backgroundColor: isDark ? 'rgba(76, 175, 80, 0.1)' : COLORS.primaryLight }]}>
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                        <Text style={styles.appliedText}>"{applied.code}" applied!</Text>
                    </View>
                )}
            </View>

            <Text style={[styles.availableTitle, { color: colors.text }]}>Available Promos</Text>
            {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} /> : (
                <FlatList
                    data={promos}
                    keyExtractor={p => p.id}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => (
                        <View style={[styles.promoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.promoLeft}>
                                <View style={[styles.tagCircle, { backgroundColor: isDark ? 'rgba(36, 107, 253, 0.1)' : COLORS.primaryLight }]}>
                                    <Ionicons name="pricetag" size={20} color={COLORS.primary} />
                                </View>
                                <View>
                                    <Text style={[styles.promoCode, { color: colors.text }]}>{item.code}</Text>
                                    <Text style={[styles.promoDesc, { color: colors.textLight }]}>{item.description}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.applyBtn} onPress={() => handleApply(item)}><Text style={styles.applyBtnText}>Apply</Text></TouchableOpacity>
                        </View>
                    )}
                />
            )}
            <View style={styles.footer}><Button title="Apply Promo Code" onPress={() => router.push({ pathname: '/(main)/checkout', params: { appliedPromo: JSON.stringify(applied) } })} disabled={!applied} /></View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: '700' },
    inputSection: { padding: SPACING.lg },
    inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 16, borderWidth: 1 },
    input: { flex: 1, height: 56, fontSize: 16, fontWeight: '600' },
    applyInlineBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
    applyInlineText: { color: COLORS.white, fontWeight: '700' },
    appliedBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginTop: 16, gap: 8 },
    appliedText: { color: COLORS.primary, fontWeight: '600', fontSize: 14 },
    availableTitle: { fontSize: 18, fontWeight: '700', marginHorizontal: SPACING.lg, marginBottom: 12 },
    list: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
    promoCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 16 },
    promoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    tagCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    promoCode: { fontSize: 16, fontWeight: '700' },
    promoDesc: { fontSize: 12, marginTop: 2 },
    applyBtn: { paddingHorizontal: 16, paddingVertical: 8 },
    applyBtnText: { color: COLORS.primary, fontWeight: '700' },
    footer: { padding: SPACING.lg, position: 'absolute', bottom: 0, left: 0, right: 0 },
});
