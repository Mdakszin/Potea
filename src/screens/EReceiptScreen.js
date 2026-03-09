import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

export default function EReceiptScreen({ route, navigation }) {
    const { order, transaction: initialTransaction } = route.params || {};
    const { colors, isDark } = useTheme();

    // Normalize data
    const data = order ? {
        name: order.items[0]?.name || 'Potea Order',
        icon: order.items[0]?.image,
        amount: order.total,
        date: order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : new Date().toLocaleString(),
        id: order.id,
        type: 'Purchase',
        items: order.items,
        isOrder: true
    } : initialTransaction;

    if (!data) return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}><Text style={{ color: colors.text }}>No Receipt Data</Text></SafeAreaView>;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>E-Receipt</Text>
                <TouchableOpacity>
                    <Ionicons name="share-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Barcode Placeholder */}
                <View style={styles.barcodeContainer}>
                    <Ionicons name="barcode-outline" size={100} color={colors.text} />
                    <Text style={[styles.barcodeNum, { color: colors.textLight }]}>{data.id?.substring(0, 6).toUpperCase()} {data.id?.substring(6, 12).toUpperCase()}</Text>
                </View>

                {/* Item(s) Info */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {data.isOrder ? (
                        data.items.map((item, index) => (
                            <View key={index} style={[styles.itemRow, index > 0 && { marginTop: 12 }]}>
                                <Image source={{ uri: item.image }} style={styles.itemImage} />
                                <View style={styles.itemTitleGroup}>
                                    <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                                    <Text style={[styles.itemQty, { color: colors.textLight }]}>Qty = {item.qty}</Text>
                                </View>
                                <Text style={[styles.infoValue, { color: colors.text }]}>${(item.price * item.qty).toFixed(2)}</Text>
                            </View>
                        ))
                    ) : (
                        <View style={styles.itemRow}>
                            {data.isTopUp ? (
                                <View style={[styles.topUpIcon, { backgroundColor: isDark ? 'rgba(76, 175, 80, 0.1)' : COLORS.primaryLight }]}>
                                    <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
                                </View>
                            ) : (
                                <Image source={{ uri: data.icon }} style={styles.itemImage} />
                            )}
                            <View style={styles.itemTitleGroup}>
                                <Text style={[styles.itemName, { color: colors.text }]}>{data.name}</Text>
                                <Text style={[styles.itemQty, { color: colors.textLight }]}>Qty = 1</Text>
                            </View>
                        </View>
                    )}

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: colors.textLight }]}>Amount</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>${data.amount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: colors.textLight }]}>Promo</Text>
                        <Text style={[styles.infoValue, { color: COLORS.primary }]}>- $0</Text>
                    </View>
                    <View style={[styles.infoRow, { marginTop: 8 }]}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                        <Text style={[styles.totalValue, { color: colors.text }]}>${data.amount.toFixed(2)}</Text>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: colors.textLight }]}>Payment Methods</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{data.isOrder ? 'Credit Card' : 'My E-Wallet'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: colors.textLight }]}>Date</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{data.date}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: colors.textLight }]}>Transaction ID</Text>
                        <View style={styles.idGroup}>
                            <Text style={[styles.infoValue, { color: colors.text }]}>{data.id}</Text>
                            <Ionicons name="copy-outline" size={14} color={COLORS.primary} />
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: colors.textLight }]}>Status</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Paid</Text>
                        </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, { color: colors.textLight }]}>Category</Text>
                        <View style={styles.categoryBadge}>
                            <Text style={[styles.categoryText, { color: colors.text }]}>{data.type}</Text>
                            <Ionicons name="chevron-down" size={14} color={colors.text} />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    headerTitle: { ...TYPOGRAPHY.h3 },
    content: { padding: SPACING.lg },
    barcodeContainer: { alignItems: 'center', marginVertical: SPACING.xl },
    barcodeNum: { ...TYPOGRAPHY.bodySmall, letterSpacing: 4, marginTop: 8 },
    card: {
        borderRadius: 24, padding: 24,
        ...SHADOWS.medium,
        borderWidth: 1,
    },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    itemImage: { width: 60, height: 60, borderRadius: 12 },
    topUpIcon: { width: 60, height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    itemTitleGroup: { flex: 1 },
    itemName: { ...TYPOGRAPHY.h3 },
    itemQty: { ...TYPOGRAPHY.bodySmall, marginTop: 4 },
    divider: { height: 1.5, marginVertical: 20 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    infoLabel: { ...TYPOGRAPHY.bodySmall },
    infoValue: { ...TYPOGRAPHY.bodySmall, fontWeight: '700' },
    totalLabel: { ...TYPOGRAPHY.body, fontWeight: '700' },
    totalValue: { ...TYPOGRAPHY.body, fontWeight: '700' },
    idGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statusBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    statusText: { ...TYPOGRAPHY.bodySmall, color: COLORS.white, fontSize: 10, fontWeight: '700' },
    categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    categoryText: { ...TYPOGRAPHY.bodySmall, fontWeight: '700' },
});
