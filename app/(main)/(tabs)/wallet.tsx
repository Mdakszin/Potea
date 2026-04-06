import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, FlatList, ActivityIndicator
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useAuth } from '../../../src/contexts/AuthContext';
import { db } from '../../../src/config/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'expo-router';

interface Transaction {
    id: string;
    name?: string;
    date?: string;
    amount: number;
    isTopUp: boolean;
    type?: string;
    createdAt: any;
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
        const transactionsRef = collection(db, 'users', currentUser.uid, 'transactions');
        const q = query(transactionsRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
            setTransactions(list);
            setLoading(false);
        }, () => setLoading(false));
        return () => unsubscribe();
    }, [currentUser]);

    const renderTransaction = ({ item }: { item: Transaction }) => (
        <TouchableOpacity
            style={[styles.transactionItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push({ pathname: '/(main)/e-receipt', params: { id: item.id } })}
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
                    <Ionicons name="leaf" size={28} color={COLORS.primary} />
                    <Text style={[styles.headerTitle, { color: colors.text }]}>My E-Wallet</Text>
                </View>
                <TouchableOpacity onPress={() => router.push('/(main)/explore')}><Ionicons name="search-outline" size={24} color={colors.text} /></TouchableOpacity>
            </View>

            <FlatList
                data={transactions}
                keyExtractor={item => item.id}
                renderItem={renderTransaction}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListHeaderComponent={
                    <View style={styles.cardContainer}>
                        <View style={[styles.card, { backgroundColor: COLORS.primary }]}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardName}>{userData?.name || 'User'}</Text>
                                <Ionicons name="leaf" size={24} color={COLORS.white} />
                            </View>
                            <Text style={styles.cardSubtitle}>Balance</Text>
                            <View style={styles.balanceRow}>
                                <Text style={styles.balanceText}>${balance.toFixed(2)}</Text>
                                <TouchableOpacity style={styles.topUpBtn} onPress={() => router.push('/(main)/top-up')}>
                                    <Ionicons name="add-circle" size={20} color={COLORS.white} />
                                    <Text style={styles.topUpText}>Top Up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text style={[styles.historyTitle, { color: colors.text }]}>Transaction History</Text>
                    </View>
                }
                ListEmptyComponent={loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} /> : <Text style={{ textAlign: 'center', marginTop: 20, color: colors.textLight }}>No transactions found</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerTitle: { ...TYPOGRAPHY.h3 },
    cardContainer: { padding: SPACING.lg },
    card: { padding: SPACING.xl, borderRadius: 28, height: 180, justifyContent: 'space-between' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardName: { color: COLORS.white, ...TYPOGRAPHY.h3 },
    cardSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 20 },
    balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    balanceText: { color: COLORS.white, fontSize: 32, fontWeight: '700' },
    topUpBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    topUpText: { color: COLORS.white, marginLeft: 6, fontWeight: '600' },
    historyTitle: { ...TYPOGRAPHY.h3, marginTop: 30, marginBottom: 10 },
    transactionItem: { flexDirection: 'row', padding: SPACING.md, borderBottomWidth: 1, alignItems: 'center' },
    iconContainer: { marginRight: SPACING.md },
    topUpIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    spentIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '700' },
    itemDate: { fontSize: 12 },
    amountInfo: { alignItems: 'flex-end' },
    amount: { fontSize: 16, fontWeight: '700' },
    typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    typeText: { fontSize: 12 },
});
