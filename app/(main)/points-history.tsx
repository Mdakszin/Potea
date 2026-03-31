import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { loyaltyService } from '../../src/services/loyaltyService';
import { PointTransaction } from '../../src/types';

type FilterType = 'all' | 'earned' | 'redeemed';

const ICON_MAP: Record<PointTransaction['type'], { icon: string; color: string }> = {
    purchase: { icon: 'cart', color: '#4CAF50' },
    care: { icon: 'water', color: '#2196F3' },
    garden: { icon: 'leaf', color: '#8BC34A' },
    review: { icon: 'star', color: '#9C27B0' },
    streak: { icon: 'flame', color: '#FF9800' },
    redeem: { icon: 'gift', color: '#E91E63' },
    bonus: { icon: 'sparkles', color: '#FFD700' },
};

export default function PointsHistoryScreen() {
    const { colors } = useTheme();
    const { currentUser } = useAuth();
    const router = useRouter();

    const [transactions, setTransactions] = useState<PointTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('all');

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        if (!currentUser) return;
        try {
            const history = await loyaltyService.getPointHistory(currentUser.uid);
            setTransactions(history);
        } catch (err) {
            console.error('Error loading point history:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = transactions.filter((t) => {
        if (filter === 'earned') return t.amount > 0;
        if (filter === 'redeemed') return t.amount < 0;
        return true;
    });

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    const totalEarned = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalRedeemed = Math.abs(transactions.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0));

    const renderTransaction = ({ item }: { item: PointTransaction }) => {
        const info = ICON_MAP[item.type] || { icon: 'ellipse', color: COLORS.primary };
        const isPositive = item.amount > 0;

        return (
            <View style={[styles.transactionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.txIcon, { backgroundColor: info.color + '15' }]}>
                    <Ionicons name={info.icon as any} size={20} color={info.color} />
                </View>
                <View style={styles.txInfo}>
                    <Text style={[styles.txReason, { color: colors.text }]} numberOfLines={1}>
                        {item.reason}
                    </Text>
                    <Text style={[styles.txDate, { color: colors.textLight }]}>
                        {formatDate(item.createdAt)}
                    </Text>
                </View>
                <Text style={[styles.txAmount, { color: isPositive ? '#4CAF50' : '#E91E63' }]}>
                    {isPositive ? '+' : ''}{item.amount}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Points History</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryRow}>
                <View style={[styles.summaryCard, { backgroundColor: '#4CAF50' + '15', borderColor: '#4CAF50' + '40' }]}>
                    <Ionicons name="trending-up" size={20} color="#4CAF50" />
                    <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>+{totalEarned.toLocaleString()}</Text>
                    <Text style={[styles.summaryLabel, { color: colors.textLight }]}>Earned</Text>
                </View>
                <View style={[styles.summaryCard, { backgroundColor: '#E91E63' + '15', borderColor: '#E91E63' + '40' }]}>
                    <Ionicons name="trending-down" size={20} color="#E91E63" />
                    <Text style={[styles.summaryValue, { color: '#E91E63' }]}>-{totalRedeemed.toLocaleString()}</Text>
                    <Text style={[styles.summaryLabel, { color: colors.textLight }]}>Redeemed</Text>
                </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterRow}>
                {(['all', 'earned', 'redeemed'] as FilterType[]).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[
                            styles.filterTab,
                            { borderColor: colors.border },
                            filter === f && styles.filterTabActive,
                        ]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[
                            styles.filterText,
                            { color: colors.textLight },
                            filter === f && styles.filterTextActive,
                        ]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Transaction List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTransaction}
                    contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: 40 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={60} color={colors.border} />
                            <Text style={[styles.emptyText, { color: colors.textLight }]}>
                                {filter === 'all'
                                    ? 'No transactions yet. Start earning points!'
                                    : `No ${filter} transactions found.`}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '700' },

    // Summary
    summaryRow: {
        flexDirection: 'row', paddingHorizontal: SPACING.lg,
        gap: SPACING.sm, marginBottom: SPACING.lg,
    },
    summaryCard: {
        flex: 1, alignItems: 'center', paddingVertical: SPACING.md,
        borderRadius: 16, borderWidth: 1,
    },
    summaryValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
    summaryLabel: { fontSize: 12, marginTop: 2 },

    // Filters
    filterRow: {
        flexDirection: 'row', paddingHorizontal: SPACING.lg,
        gap: SPACING.sm, marginBottom: SPACING.lg,
    },
    filterTab: {
        flex: 1, paddingVertical: 10, borderRadius: 12,
        borderWidth: 1, alignItems: 'center',
    },
    filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterText: { fontSize: 14, fontWeight: '600' },
    filterTextActive: { color: '#fff' },

    // Transactions
    transactionCard: {
        flexDirection: 'row', alignItems: 'center', padding: SPACING.md,
        borderRadius: 14, borderWidth: 1, marginBottom: SPACING.sm,
    },
    txIcon: {
        width: 42, height: 42, borderRadius: 12, alignItems: 'center',
        justifyContent: 'center', marginRight: SPACING.md,
    },
    txInfo: { flex: 1 },
    txReason: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    txDate: { fontSize: 12 },
    txAmount: { fontSize: 18, fontWeight: '800', marginLeft: SPACING.sm },

    // Empty
    emptyContainer: { alignItems: 'center', paddingVertical: 60 },
    emptyText: { fontSize: 15, marginTop: 12, textAlign: 'center' },
});
