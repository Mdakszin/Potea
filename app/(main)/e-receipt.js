import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePurchases } from '../../src/hooks/usePurchases';
import { ActivityIndicator } from 'react-native';

export default function EReceiptScreen() {
    const { id, type, order: orderStr, transaction: transStr } = useLocalSearchParams();
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const { getOrderDetails, getTransactionDetails } = usePurchases();

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Check if data was passed directly
                if (orderStr) {
                    const parsed = JSON.parse(orderStr);
                    setData({
                        ...parsed,
                        isOrder: true,
                        amount: parsed.total,
                        date: parsed.createdAt?.toDate ? parsed.createdAt.toDate().toLocaleString() : new Date().toLocaleString()
                    });
                } else if (transStr) {
                    const parsed = JSON.parse(transStr);
                    setData({
                        ...parsed,
                        date: parsed.date || (parsed.createdAt?.toDate ? parsed.createdAt.toDate().toLocaleString() : new Date().toLocaleString())
                    });
                } else if (id) {
                    // Fetch from Firestore if only ID is provided
                    if (type === 'topup') {
                        const trans = await getTransactionDetails(id);
                        if (trans) setData({ ...trans, date: trans.createdAt?.toDate()?.toLocaleString() });
                    } else {
                        const order = await getOrderDetails(id);
                        if (order) {
                            setData({
                                ...order,
                                isOrder: true,
                                amount: order.total,
                                date: order.createdAt?.toDate()?.toLocaleString()
                            });
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching receipt data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, type, orderStr, transStr]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    if (!data) return <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}><Text style={{ color: colors.text, textAlign: 'center', marginTop: 50 }}>No Receipt Data Found</Text></SafeAreaView>;

    const items = data.items || [];
    const subtotal = data.subtotal || items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shippingFee = data.shippingFee || 0;
    const promoDiscount = data.promoDiscount || 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>E-Receipt</Text>
                <TouchableOpacity><Ionicons name="share-outline" size={24} color={colors.text} /></TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.barcodeContainer}>
                    <Ionicons name="barcode-outline" size={100} color={colors.text} />
                    <Text style={[styles.barcodeNum, { color: colors.textLight }]}>{data.id?.substring(0, 6).toUpperCase()} {data.id?.substring(6, 12).toUpperCase()}</Text>
                </View>

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {data.isOrder ? (
                        items.map((item, index) => (
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
                            ) : <Image source={{ uri: data.icon || 'https://via.placeholder.com/52' }} style={styles.itemImage} />}
                            <View style={styles.itemTitleGroup}>
                                <Text style={[styles.itemName, { color: colors.text }]}>{data.name}</Text>
                                <Text style={[styles.itemQty, { color: colors.textLight }]}>Qty = 1</Text>
                            </View>
                            <Text style={[styles.infoValue, { color: colors.text }]}>${Number(data.amount).toFixed(2)}</Text>
                        </View>
                    )}

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.textLight }]}>Amount</Text><Text style={[styles.infoValue, { color: colors.text }]}>${Number(subtotal).toFixed(2)}</Text></View>
                    <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.textLight }]}>Shipping</Text><Text style={[styles.infoValue, { color: colors.text }]}>${Number(shippingFee).toFixed(2)}</Text></View>
                    {promoDiscount > 0 && <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.textLight }]}>Promo</Text><Text style={[styles.infoValue, { color: "#FF4C4C" }]}>- ${Number(promoDiscount).toFixed(2)}</Text></View>}
                    <View style={[styles.infoRow, { marginTop: 8 }]}><Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text><Text style={[styles.totalValue, { color: colors.text }]}>${Number(data.amount).toFixed(2)}</Text></View>
                    
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.textLight }]}>Payment Method</Text><Text style={[styles.infoValue, { color: colors.text }]}>{data.payment?.label || (data.isTopUp ? 'My E-Wallet' : 'Credit Card')}</Text></View>
                    <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.textLight }]}>Date</Text><Text style={[styles.infoValue, { color: colors.text }]}>{data.date}</Text></View>
                    <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.textLight }]}>Transaction ID</Text><Text style={[styles.infoValue, { color: colors.text }]}>{data.id}</Text></View>
                    <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: colors.textLight }]}>Status</Text><Text style={[styles.statusBadgeText]}>Success</Text></View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
    headerTitle: { fontSize: 24, fontWeight: '700' },
    content: { padding: SPACING.lg },
    barcodeContainer: { alignItems: 'center', marginVertical: 24 },
    barcodeNum: { fontSize: 14, marginTop: 8 },
    card: { borderRadius: 32, padding: 24, borderWidth: 1 },
    itemRow: { flexDirection: 'row', alignItems: 'center' },
    itemImage: { width: 52, height: 52, borderRadius: 12 },
    itemTitleGroup: { flex: 1, marginLeft: 16 },
    itemName: { fontSize: 16, fontWeight: '700' },
    itemQty: { fontSize: 12, marginTop: 2 },
    divider: { height: 1, marginVertical: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    infoLabel: { fontSize: 14 },
    infoValue: { fontSize: 14, fontWeight: '600' },
    totalLabel: { fontSize: 16, fontWeight: '700' },
    totalValue: { fontSize: 16, fontWeight: '700' },
    statusBadgeText: { fontSize: 12, fontWeight: '700', color: COLORS.white, backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    topUpIcon: { width: 52, height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
