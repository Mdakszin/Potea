import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    FlatList, Image, ActivityIndicator
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const EmptyOrders = ({ activeTab, colors }) => (
    <View style={emptyStyles.container}>
        <View style={emptyStyles.iconContainer}>
            <Ionicons name="document-text-outline" size={80} color={colors.primary} />
        </View>
        <Text style={[emptyStyles.title, { color: colors.text }]}>No {activeTab} orders yet</Text>
        <Text style={[emptyStyles.subtitle, { color: colors.textLight }]}>
            You don't have any {activeTab} orders at this time. Start shopping to see them here!
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
    const { currentUser } = useAuth();
    const { isDark, colors } = useTheme();
    const [activeTab, setActiveTab] = useState('active');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        setLoading(true);
        const q = query(
            collection(db, 'orders'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter by tab status
            const filtered = list.filter(order => {
                if (activeTab === 'active') {
                    return order.status !== 'Completed' && order.status !== 'Cancelled';
                } else {
                    return order.status === 'Completed' || order.status === 'Cancelled';
                }
            });

            setOrders(filtered);
            setLoading(false);
        }, (error) => {
            console.error("Orders fetch error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, activeTab]);

    const renderOrderItem = ({ item }) => {
        const firstItem = item.items[0];
        const totalItems = item.items.reduce((sum, i) => sum + i.qty, 0);

        return (
            <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
                <Image source={{ uri: firstItem.image }} style={[styles.orderImage, { backgroundColor: colors.surface }]} />
                <View style={styles.orderInfo}>
                    <Text style={[styles.plantName, { color: colors.text }]} numberOfLines={1}>
                        {firstItem.name} {item.items.length > 1 ? `+ ${item.items.length - 1} more` : ''}
                    </Text>
                    <Text style={[styles.orderQty, { color: colors.textLight }]}>Total Items: {totalItems}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.statusText, item.status === 'Completed' ? styles.statusCompleted : styles.statusActive]}>
                            {item.status}
                        </Text>
                    </View>
                    <View style={styles.bottomRow}>
                        <Text style={styles.orderPrice}>${item.total.toFixed(2)}</Text>
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
                                <Text style={styles.actionBtnText}>Re-order</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="leaf" size={24} color={COLORS.primary} style={styles.logo} />
                    <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="search" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="ellipsis-horizontal-circle" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && [styles.activeTab, { borderBottomColor: COLORS.primary }]]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[styles.tabText, { color: colors.textLight }, activeTab === 'active' && styles.activeTabText]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'completed' && [styles.activeTab, { borderBottomColor: COLORS.primary }]]}
                    onPress={() => setActiveTab('completed')}
                >
                    <Text style={[styles.tabText, { color: colors.textLight }, activeTab === 'completed' && styles.activeTabText]}>Completed</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : orders.length === 0 ? (
                <EmptyOrders activeTab={activeTab} colors={colors} />
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
        ...SHADOWS.small,
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
