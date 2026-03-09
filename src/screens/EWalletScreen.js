import React from 'react';
import {
    View, Text, StyleSheet, Image, ScrollView,
    TouchableOpacity, FlatList
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TRANSACTIONS } from '../constants/data';
import { useTheme } from '../contexts/ThemeContext';

export default function EWalletScreen({ navigation }) {
    const { isDark, colors } = useTheme();
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
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemDate, { color: colors.textLight }]}>{item.date}</Text>
            </View>
            <View style={styles.amountInfo}>
                <Text style={[styles.amount, { color: colors.text }]}>${item.amount.toFixed(2)}</Text>
                <View style={styles.typeTag}>
                    <Text style={[styles.typeText, { color: colors.textLight }]}>{item.type}</Text>
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
                    <TouchableOpacity style={styles.headerBtn}>
                        <Ionicons name="ellipsis-horizontal-circle" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Wallet Card */}
                <View style={styles.cardContainer}>
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.userName}>Andrew Ainsley</Text>
                                <Text style={styles.cardNumber}>•••• •••• •••• 3629</Text>
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
                                <Text style={styles.balanceValue}>$9,449</Text>
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

                {/* Transaction History */}
                <View style={styles.historySection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Transaction History</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={TRANSACTIONS}
                        keyExtractor={item => item.id}
                        renderItem={renderTransaction}
                        scrollEnabled={false}
                        contentContainerStyle={styles.list}
                    />
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
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerTitle: { ...TYPOGRAPHY.h2 },
    headerRight: { flexDirection: 'row', gap: 16 },
    headerBtn: { padding: 4 },

    cardContainer: { paddingHorizontal: SPACING.lg, marginVertical: SPACING.md },
    card: {
        backgroundColor: COLORS.primary,
        borderRadius: 28,
        padding: 24,
        height: 180,
        justifyContent: 'space-between',
        ...SHADOWS.large,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    userName: { ...TYPOGRAPHY.body, color: COLORS.white, fontWeight: '700' },
    cardNumber: { ...TYPOGRAPHY.bodySmall, color: COLORS.white, opacity: 0.8 },
    cardLogo: { width: 50, height: 20 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    balanceLabel: { ...TYPOGRAPHY.bodySmall, color: COLORS.white, opacity: 0.8 },
    balanceValue: { ...TYPOGRAPHY.h1, color: COLORS.white, fontSize: 32 },
    topUpBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: COLORS.white + '30',
        paddingVertical: 8, paddingHorizontal: 16,
        borderRadius: 20,
    },
    topUpText: { ...TYPOGRAPHY.bodySmall, color: COLORS.white, fontWeight: '700' },

    historySection: { paddingHorizontal: SPACING.lg, marginTop: SPACING.xl },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    sectionTitle: { ...TYPOGRAPHY.h3 },
    seeAll: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: '700' },

    list: { paddingBottom: SPACING.xl },
    transactionItem: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: SPACING.md,
        marginBottom: SPACING.sm,
    },
    iconContainer: {
        width: 54, height: 54, borderRadius: 27,
        alignItems: 'center', justifyContent: 'center',
        marginRight: SPACING.md,
    },
    topUpIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
    itemImage: { width: 54, height: 54, borderRadius: 27 },
    itemInfo: { flex: 1 },
    itemName: { ...TYPOGRAPHY.body, fontWeight: '700' },
    itemDate: { ...TYPOGRAPHY.bodySmall, marginTop: 4 },
    amountInfo: { alignItems: 'flex-end' },
    amount: { ...TYPOGRAPHY.body, fontWeight: '700' },
    typeTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    typeText: { ...TYPOGRAPHY.bodySmall, fontSize: 10 },
});
