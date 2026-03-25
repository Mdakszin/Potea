import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { db } from '../../src/config/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';

interface Transaction {
    id: string;
    isTopUp: boolean;
    name?: string;
    date?: string;
    amount: number;
    type?: string;
    method?: string;
    createdAt?: Timestamp;
}

export default function EWalletScreen() {
    const { isDark, colors } = useTheme();
    const { currentUser, userData } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const balance = userData?.balance || 0;

    useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, 'users', currentUser.uid, 'transactions'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
            setTransactions(list);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    const renderTransaction = ({ item }: { item: Transaction }) => (
        <TouchableOpacity 
            style={[styles.transactionItem, { borderBottomColor: colors.border }]} 
            onPress={() => router.push({ pathname: '/(main)/e-receipt', params: { transaction: JSON.stringify(item) } })}
        >
            <View style={styles.iconContainer}>
                {item.isTopUp ? (
                    <View style={[styles.topUpIcon, { backgroundColor: isDark ? 'rgba(76, 175, 80, 0.1)' : COLORS.primaryLight }]}>
                        <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
                    </View>
                ) : (
                    <View style={[styles.spentIcon, { backgroundColor: isDark ? 'rgba(255, 76, 76, 0.1)' : 'rgba(255, 76, 76, 0.05)' }]}>
                        <Ionicons name="cart-outline" size={24} color="#FF4C4C" />
                    </View>
                )}
            </View>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name || (item.isTopUp ? 'Top Up Wallet' : 'Order Payment')}</Text>
                <Text style={[styles.itemDate, { color: colors.textLight }]}>{item.date || 'Today'}</Text>
            </View>
            <View style={styles.amountInfo}>
                <Text style={[styles.amount, { color: colors.text }]}>${item.amount.toFixed(2)}</Text>
                <View style={styles.typeTag}>
                    <Text style={[styles.typeText, { color: colors.textLight }]}>{item.type || (item.isTopUp ? 'Top Up' : 'Payment')}</Text>
                    <Ionicons name={item.isTopUp ? "arrow-up-circle" : "arrow-down-circle"} size={14} color={item.isTopUp ? "#2ECC71" : "#FF4C4C"} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>My E-Wallet</Text>
                </View>
                <TouchableOpacity style={styles.headerBtn}>
                    <Ionicons name="search-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={transactions}
                keyExtractor={item => item.id}
                renderItem={renderTransaction}
                ListHeaderComponent={
                    <View style={styles.cardContainer}>
                        <View style={[styles.card, { backgroundColor: COLORS.primary }]}>
                            <View style={styles.cardHeader}>
                                <View>
                                    <Text style={styles.cardName}>{userData?.name || 'User'}</Text>
                                    <Text style={styles.cardNumber}>•••• •••• •••• ••••</Text>
                                </View>
                                <Ionicons name="logo-bitcoin" size={32} color={COLORS.white} />
                            </View>
                            <View style={styles.cardFooter}>
                                <View>
                                    <Text style={styles.balanceLabel}>Your balance</Text>
                                    <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
                                </View>
                                <TouchableOpacity style={styles.topUpBtn} onPress={() => router.push('/(main)/top-up')}>
                                    <Ionicons name="add-circle" size={20} color={COLORS.white} />
                                    <Text style={styles.topUpLabel}>Top Up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
                            <TouchableOpacity onPress={() => router.push('/(main)/transaction-history')}>
                                <Text style={styles.seeAll}>See All</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                }
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} /> : <Text style={{ textAlign: 'center', color: colors.textLight, marginTop: 40 }}>No transactions yet.</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerTitle: { fontSize: 24, fontWeight: '700' },
    headerBtn: { padding: 4 },
    cardContainer: { padding: SPACING.lg },
    card: { borderRadius: 32, padding: 24, height: 200, justifyContent: 'space-between', ...SHADOWS.medium },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    cardName: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
    cardNumber: { color: COLORS.white, fontSize: 14, marginTop: 4, opacity: 0.8 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    balanceLabel: { color: COLORS.white, fontSize: 14, opacity: 0.8 },
    balanceValue: { color: COLORS.white, fontSize: 32, fontWeight: '700' },
    topUpBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, gap: 8 },
    topUpLabel: { color: COLORS.white, fontWeight: '700' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 },
    sectionTitle: { fontSize: 20, fontWeight: '700' },
    seeAll: { color: COLORS.primary, fontWeight: '700' },
    listContent: { paddingBottom: 24 },
    transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: SPACING.lg, borderBottomWidth: 1 },
    iconContainer: { marginRight: 16 },
    topUpIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    spentIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '700' },
    itemDate: { fontSize: 12, marginTop: 4 },
    amountInfo: { alignItems: 'flex-end' },
    amount: { fontSize: 16, fontWeight: '700' },
    typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    typeText: { fontSize: 12 },
});
