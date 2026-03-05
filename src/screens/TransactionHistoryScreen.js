import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Image,
    TouchableOpacity, FlatList
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TRANSACTIONS } from '../constants/data';

export default function TransactionHistoryScreen({ navigation }) {
    const renderTransaction = ({ item }) => (
        <TouchableOpacity
            style={styles.transactionItem}
            onPress={() => navigation.navigate('EReceipt', { transaction: item })}
        >
            <View style={styles.iconContainer}>
                {item.isTopUp ? (
                    <View style={styles.topUpIcon}>
                        <Ionicons name="wallet-outline" size={24} color={COLORS.primary} />
                    </View>
                ) : (
                    <Image source={{ uri: item.icon }} style={styles.itemImage} />
                )}
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDate}>{item.date}</Text>
            </View>
            <View style={styles.amountInfo}>
                <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
                <View style={styles.typeTag}>
                    <Text style={styles.typeText}>{item.type}</Text>
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Transaction History</Text>
                <TouchableOpacity>
                    <Ionicons name="search-outline" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={TRANSACTIONS}
                keyExtractor={item => item.id}
                renderItem={renderTransaction}
                contentContainerStyle={styles.list}
            />
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
    list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
    transactionItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: SPACING.md,
    },
    iconContainer: {
        width: 54, height: 54, borderRadius: 27,
        backgroundColor: COLORS.card,
        alignItems: 'center', justifyContent: 'center',
        marginRight: SPACING.md,
    },
    topUpIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
    itemImage: { width: 54, height: 54, borderRadius: 27 },
    itemInfo: { flex: 1 },
    itemName: { ...TYPOGRAPHY.body, fontWeight: '700' },
    itemDate: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, marginTop: 4 },
    amountInfo: { alignItems: 'flex-end' },
    amount: { ...TYPOGRAPHY.body, fontWeight: '700' },
    typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    typeText: { ...TYPOGRAPHY.bodySmall, fontSize: 10, color: COLORS.textLight },
});
