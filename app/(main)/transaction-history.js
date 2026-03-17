import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { usePurchases } from '../../src/hooks/usePurchases';

export default function TransactionHistoryScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { transactions, loading, loadingMore, hasMore, loadMore } = usePurchases();

    const renderTransaction = ({ item }) => (
        <TouchableOpacity 
            style={[styles.transactionItem, { borderBottomColor: colors.border }]} 
            onPress={() => router.push({ 
                pathname: '/(main)/e-receipt', 
                params: { 
                    id: item.id,
                    type: item.isTopUp ? 'topup' : 'order'
                } 
            })}
        >
            <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
                {item.isTopUp ? (
                    <View style={styles.topUpIcon}><Ionicons name="wallet-outline" size={24} color={COLORS.primary} /></View>
                ) : (
                    item.icon ? (
                        <Image source={{ uri: item.icon }} style={styles.itemImage} />
                    ) : (
                        <View style={styles.topUpIcon}><Ionicons name="bag-handle-outline" size={24} color={COLORS.primary} /></View>
                    )
                )}
            </View>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemDate, { color: colors.textLight }]}>{item.date || (item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'N/A')}</Text>
            </View>
            <View style={styles.amountInfo}>
                <Text style={[styles.amount, { color: colors.text }]}>${Number(item.amount).toFixed(2)}</Text>
                <View style={styles.typeTag}>
                    <Text style={[styles.typeText, { color: colors.textLight }]}>{item.isTopUp ? 'Top Up' : 'Orders'}</Text>
                    <Ionicons name={item.isTopUp ? "arrow-up-circle" : "arrow-down-circle"} size={14} color={item.isTopUp ? "#2ECC71" : "#FF4C4C"} />
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderFooter = () => {
        if (!loadingMore) return <View style={{ height: 20 }} />;
        return (
            <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction History</Text>
                <TouchableOpacity><Ionicons name="search-outline" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList 
                    data={transactions} 
                    keyExtractor={item => item.id} 
                    renderItem={renderTransaction} 
                    contentContainerStyle={styles.list} 
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        <View style={{ flex: 1, alignItems: 'center', marginTop: 50 }}>
                            <Text style={{ color: colors.textLight }}>No transactions found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
    headerTitle: { fontSize: 24, fontWeight: '700' },
    list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 1 },
    iconContainer: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    topUpIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
    itemImage: { width: 54, height: 54, borderRadius: 27 },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '700' },
    itemDate: { fontSize: 12, marginTop: 4 },
    amountInfo: { alignItems: 'flex-end' },
    amount: { fontSize: 16, fontWeight: '700' },
    typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    typeText: { fontSize: 10 },
});
