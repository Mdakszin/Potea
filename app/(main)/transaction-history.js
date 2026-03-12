import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { TRANSACTIONS } from '../../src/constants/data';

export default function TransactionHistoryScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const renderTransaction = ({ item }) => (
        <TouchableOpacity style={[styles.transactionItem, { borderBottomColor: colors.border }]} onPress={() => router.push({ pathname: '/(main)/e-receipt', params: { transaction: JSON.stringify(item) } })}>
            <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
                {item.isTopUp ? (
                    <View style={styles.topUpIcon}><Ionicons name="wallet-outline" size={24} color={COLORS.primary} /></View>
                ) : <Image source={{ uri: item.icon }} style={styles.itemImage} />}
            </View>
            <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemDate, { color: colors.textLight }]}>{item.date}</Text>
            </View>
            <View style={styles.amountInfo}>
                <Text style={[styles.amount, { color: colors.text }]}>${item.amount.toFixed(2)}</Text>
                <View style={styles.typeTag}>
                    <Text style={[styles.typeText, { color: colors.textLight }]}>{item.type}</Text>
                    <Ionicons name={item.isTopUp ? "arrow-up-circle" : "arrow-down-circle"} size={14} color={item.isTopUp ? "#2ECC71" : "#FF4C4C"} />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction History</Text>
                <TouchableOpacity><Ionicons name="search-outline" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <FlatList data={TRANSACTIONS} keyExtractor={item => item.id} renderItem={renderTransaction} contentContainerStyle={styles.list} />
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
