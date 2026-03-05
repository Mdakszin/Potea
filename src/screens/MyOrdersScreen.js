import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    FlatList, Image
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PLANTS } from '../constants/data';

// Mock data for orders
const ACTIVE_ORDERS = [
    {
        id: '1',
        plant: PLANTS[0],
        qty: 1,
        status: 'In Delivery',
        price: 29.00,
    },
    {
        id: '2',
        plant: PLANTS[1],
        qty: 3,
        status: 'In Delivery',
        price: 99.00,
    },
    {
        id: '3',
        plant: PLANTS[4],
        qty: 2,
        status: 'In Delivery',
        price: 50.00,
    },
];

const COMPLETED_ORDERS = [
    {
        id: '101',
        plant: PLANTS[2],
        qty: 2,
        status: 'Completed',
        price: 70.00,
    },
    {
        id: '102',
        plant: PLANTS[3],
        qty: 4,
        status: 'Completed',
        price: 75.00,
    },
    {
        id: '103',
        plant: PLANTS[5],
        qty: 1,
        status: 'Completed',
        price: 49.00,
    },
];

const EmptyOrders = () => (
    <View style={emptyStyles.container}>
        <View style={emptyStyles.iconContainer}>
            <Ionicons name="document-text-outline" size={80} color={COLORS.primary} />
        </View>
        <Text style={emptyStyles.title}>You don't have an order yet</Text>
        <Text style={emptyStyles.subtitle}>
            You don't have an active orders at this time
        </Text>
    </View>
);

const emptyStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    title: {
        ...TYPOGRAPHY.h3,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
    subtitle: {
        ...TYPOGRAPHY.bodySmall,
        textAlign: 'center',
        color: COLORS.textLight,
        lineHeight: 20,
    }
});

export default function MyOrdersScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('active');

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderCard}>
            <Image source={{ uri: item.plant.image }} style={styles.orderImage} />
            <View style={styles.orderInfo}>
                <Text style={styles.plantName}>{item.plant.name}</Text>
                <Text style={styles.orderQty}>Qty: {item.qty}</Text>
                <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, item.status === 'Completed' ? styles.statusCompleted : styles.statusActive]}>
                        {item.status}
                    </Text>
                </View>
                <View style={styles.bottomRow}>
                    <Text style={styles.orderPrice}>${item.price.toFixed(2)}</Text>
                    {activeTab === 'active' ? (
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('TrackOrder', { order: item })}
                        >
                            <Text style={styles.actionBtnText}>Track Order</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => navigation.navigate('LeaveReview', { order: item })}
                        >
                            <Text style={styles.actionBtnText}>Leave a Review</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );

    const orders = activeTab === 'active' ? ACTIVE_ORDERS : COMPLETED_ORDERS;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="leaf" size={24} color={COLORS.primary} style={styles.logo} />
                    <Text style={styles.headerTitle}>My Orders</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="search" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="ellipsis-horizontal-circle" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
                    onPress={() => setActiveTab('completed')}
                >
                    <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Completed</Text>
                </TouchableOpacity>
            </View>

            {orders.length === 0 ? (
                <EmptyOrders />
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        marginRight: SPACING.sm,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIcon: {
        marginLeft: SPACING.md,
    },
    tabContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        marginHorizontal: SPACING.lg,
    },
    tab: {
        flex: 1,
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
    activeTab: {
        borderBottomWidth: 4,
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        color: COLORS.textLight,
    },
    activeTabText: {
        color: COLORS.primary,
    },
    listContent: {
        padding: SPACING.lg,
    },
    orderCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        // Elevation for Android
        elevation: 4,
    },
    orderImage: {
        width: 100,
        height: 100,
        borderRadius: 20,
        backgroundColor: COLORS.card,
    },
    orderInfo: {
        flex: 1,
        marginLeft: SPACING.md,
        justifyContent: 'space-between',
    },
    plantName: {
        ...TYPOGRAPHY.h3,
    },
    orderQty: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textLight,
        marginVertical: 2,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: COLORS.card,
        marginVertical: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    statusActive: {
        color: COLORS.primary,
    },
    statusCompleted: {
        color: '#246BFD',
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SPACING.xs,
    },
    orderPrice: {
        ...TYPOGRAPHY.h3,
        color: COLORS.primary,
    },
    actionBtn: {
        backgroundColor: COLORS.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    actionBtnText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '700',
    },
});
