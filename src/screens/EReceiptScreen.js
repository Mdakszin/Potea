import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function EReceiptScreen({ route, navigation }) {
    const { order, transaction: initialTransaction } = route.params || {};

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

    if (!data) return <SafeAreaView style={styles.container}><Text>No Receipt Data</Text></SafeAreaView>;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>E-Receipt</Text>
                <TouchableOpacity>
                    <Ionicons name="share-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Barcode Placeholder */}
                <View style={styles.barcodeContainer}>
                    <Ionicons name="barcode-outline" size={100} color={COLORS.text} />
                    <Text style={styles.barcodeNum}>{data.id?.substring(0, 6).toUpperCase()} {data.id?.substring(6, 12).toUpperCase()}</Text>
                </View>

                {/* Item(s) Info */}
                <View style={styles.card}>
                    {data.isOrder ? (
                        data.items.map((item, index) => (
                            <View key={index} style={[styles.itemRow, index > 0 && { marginTop: 12 }]}>
                                <Image source={{ uri: item.image }} style={styles.itemImage} />
                                <View style={styles.itemTitleGroup}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemQty}>Qty = {item.qty}</Text>
                                </View>
                                <Text style={styles.infoValue}>${(item.price * item.qty).toFixed(2)}</Text>
                            </View>
                        ))
                    ) : (
                        <View style={styles.itemRow}>
                            {data.isTopUp ? (
                                <View style={styles.topUpIcon}>
                                    <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
                                </View>
                            ) : (
                                <Image source={{ uri: data.icon }} style={styles.itemImage} />
                            )}
                            <View style={styles.itemTitleGroup}>
                                <Text style={styles.itemName}>{data.name}</Text>
                                <Text style={styles.itemQty}>Qty = 1</Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Amount</Text>
                        <Text style={styles.infoValue}>${data.amount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Promo</Text>
                        <Text style={[styles.infoValue, { color: COLORS.primary }]}>- $0</Text>
                    </View>
                    <View style={[styles.infoRow, { marginTop: 8 }]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>${data.amount.toFixed(2)}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Methods</Text>
                        <Text style={styles.infoValue}>{data.isOrder ? 'Credit Card' : 'My E-Wallet'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Date</Text>
                        <Text style={styles.infoValue}>{data.date}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Transaction ID</Text>
                        <View style={styles.idGroup}>
                            <Text style={styles.infoValue}>{data.id}</Text>
                            <Ionicons name="copy-outline" size={14} color={COLORS.primary} />
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Status</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Paid</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Category</Text>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryText}>{data.type}</Text>
                            <Ionicons name="chevron-down" size={14} color={COLORS.text} />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    headerTitle: { ...TYPOGRAPHY.h3 },
    content: { padding: SPACING.lg },
    barcodeContainer: { alignItems: 'center', marginVertical: SPACING.xl },
    barcodeNum: { ...TYPOGRAPHY.bodySmall, letterSpacing: 4, marginTop: 8 },
    card: {
        backgroundColor: COLORS.white, borderRadius: 24, padding: 24,
        ...SHADOWS.medium,
        borderWidth: 1, borderColor: COLORS.border,
    },
    itemRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    itemImage: { width: 60, height: 60, borderRadius: 12 },
    topUpIcon: { width: 60, height: 60, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
    itemTitleGroup: { flex: 1 },
    itemName: { ...TYPOGRAPHY.h3 },
    itemQty: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, marginTop: 4 },
    divider: { height: 1.5, backgroundColor: COLORS.border, marginVertical: 20 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    infoLabel: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight },
    infoValue: { ...TYPOGRAPHY.bodySmall, color: COLORS.text, fontWeight: '700' },
    totalLabel: { ...TYPOGRAPHY.body, fontWeight: '700' },
    totalValue: { ...TYPOGRAPHY.body, fontWeight: '700' },
    idGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statusBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    statusText: { ...TYPOGRAPHY.bodySmall, color: COLORS.white, fontSize: 10, fontWeight: '700' },
    categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    categoryText: { ...TYPOGRAPHY.bodySmall, fontWeight: '700' },
});
