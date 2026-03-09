import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Image, ScrollView,
    TouchableOpacity, FlatList, ActivityIndicator
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

export default function EWalletScreen({ navigation }) {
    const { isDark, colors } = useTheme();
    const { currentUser, userData } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const balance = userData?.balance || 0;
    const displayName = userData?.name || currentUser?.displayName || 'User';

    useEffect(() => {
        if (!currentUser) return;

        const transactionsRef = collection(db, 'users', currentUser.uid, 'transactions');
        const q = query(transactionsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTransactions(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching transactions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);
    const renderTransaction = ({ item }) => (
        <TouchableOpacity
            style={[styles.transactionItem, { borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate('EReceipt', { transaction: item })}
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
                    <Ionicons
                        name={item.isTopUp ? "arrow-up-circle" : "arrow-down-circle"}
                        size={14}
                        color={item.isTopUp ? "#2ECC71" : "#FF4C4C"}
                    />
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
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerBtn}>
                        <Ionicons name="search-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flex: 1 }}>
                <FlatList
                    data={transactions}
                    keyExtractor={item => item.id}
                    renderItem={renderTransaction}
                    ListHeaderComponent={
                        <>
                            {/* Wallet Card */}
                            <View style={styles.cardContainer}>
                                <View style={[styles.card, { backgroundColor: COLORS.primary }]}>
                                    <View style={styles.cardHeader}>
                                        <View>
                                            <Text style={styles.userName}>{displayName}</Text>
                                            <Text style={styles.cardNumber}>•••• •••• •••• {currentUser?.uid?.slice(-4) || '0000'}</Text>
                                        </View>
                                        <Image
                                            source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png' }}
                                            style={styles.cardLogo}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <View style={styles.cardFooter}>
                                        <View>
                                            <Text style={styles.balanceLabel}>Your balance</Text>
                                            <Text style={styles.balanceValue}>${balance.toLocaleString()}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.topUpBtn}
                                            onPress={() => navigation.navigate('TopUpWallet')}
                                        >
                                            <Ionicons name="add-circle" size={20} color={COLORS.white} />
                                            <Text style={styles.topUpText}>Top Up</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Transaction History Header */}
                            <View style={styles.historySection}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
                                    <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
                                        <Text style={styles.seeAll}>See All</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    }
                    ListEmptyComponent={
                        !loading && (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="receipt-outline" size={60} color={colors.textLight} style={{ opacity: 0.3 }} />
                                <Text style={[styles.emptyText, { color: colors.textLight }]}>No transactions yet</Text>
                            </View>
                        )
                    }
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerTitle: { ...TYPOGRAPHY.h2 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerBtn: { padding: 4 },
    cardContainer: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    card: {
        padding: 24, borderRadius: 32,
        ...SHADOWS.medium,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
    userName: { ...TYPOGRAPHY.h3, color: COLORS.white, marginBottom: 4 },
    cardNumber: { ...TYPOGRAPHY.bodySmall, color: COLORS.white, opacity: 0.8 },
    cardLogo: { width: 50, height: 20 },
    balanceLabel: { ...TYPOGRAPHY.bodySmall, color: COLORS.white, opacity: 0.8, marginBottom: 4 },
    balanceValue: { ...TYPOGRAPHY.h1, color: COLORS.white, fontSize: 32 },
    topUpBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16,
        paddingVertical: 10, borderRadius: 20, alignSelf: 'flex-end',
    },
    topUpText: { ...TYPOGRAPHY.bodySmall, color: COLORS.white, fontWeight: '700' },
    historySection: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    sectionTitle: { ...TYPOGRAPHY.h3 },
    seeAll: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: '700' },
    transactionItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg, borderBottomWidth: 1,
    },
    iconContainer: { marginRight: SPACING.md },
    topUpIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
    spentIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
    itemImage: { width: 50, height: 50, borderRadius: 25 },
    itemInfo: { flex: 1 },
    itemName: { ...TYPOGRAPHY.body, fontWeight: '700', marginBottom: 4 },
    itemDate: { fontSize: 12 },
    amountInfo: { alignItems: 'flex-end' },
    amount: { ...TYPOGRAPHY.body, fontWeight: '700', marginBottom: 4 },
    typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    typeText: { fontSize: 10 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
    emptyText: { ...TYPOGRAPHY.body, marginTop: 12, opacity: 0.6 },
});
