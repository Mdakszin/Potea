import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function EReceiptScreen({ route, navigation }) {
    const { transaction } = route.params;

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
                    <Text style={styles.barcodeNum}>728362  637272</Text>
                </View>

                {/* Item Info */}
                <View style={styles.card}>
                    <View style={styles.itemRow}>
                        {transaction.isTopUp ? (
                            <View style={styles.topUpIcon}>
                                <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
                            </View>
                        ) : (
                            <Image source={{ uri: transaction.icon }} style={styles.itemImage} />
                        )}
                        <View style={styles.itemTitleGroup}>
                            <Text style={styles.itemName}>{transaction.name}</Text>
                            <Text style={styles.itemQty}>Qty = 1</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Amount</Text>
                        <Text style={styles.infoValue}>${transaction.amount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Promo</Text>
                        <Text style={[styles.infoValue, { color: COLORS.primary }]}>- $0</Text>
                    </View>
                    <View style={[styles.infoRow, { marginTop: 8 }]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>${transaction.amount.toFixed(2)}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Methods</Text>
                        <Text style={styles.infoValue}>My E-Wallet</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Date</Text>
                        <Text style={styles.infoValue}>{transaction.date === 'now' ? 'Dec 15, 2024 | 10:00 AM' : transaction.date}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Transaction ID</Text>
                        <View style={styles.idGroup}>
                            <Text style={styles.infoValue}>SK7263727249</Text>
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
                            <Text style={styles.categoryText}>{transaction.type}</Text>
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
        elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
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
