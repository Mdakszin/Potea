import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    FlatList, Image, ActivityIndicator, Platform
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../../src/config/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import { Order, OrderStatus } from '../../../src/types';



const EmptyOrders = ({ activeTab, colors }: { activeTab: string; colors: any }) => (
    <View style={emptyStyles.container}>
        <View style={[emptyStyles.iconContainer, { backgroundColor: COLORS.primaryLight }]}>
            <Ionicons name="document-text-outline" size={80} color={COLORS.primary} />
        </View>
        <Text style={[emptyStyles.title, { color: colors.text }]}>No {activeTab} orders yet</Text>
        <Text style={[emptyStyles.subtitle, { color: colors.textLight }]}>
            You don't have any {activeTab} orders at this time. Start shopping to see them here!
        </Text>
    </View>
);

const emptyStyles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
    iconContainer: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
    title: { ...TYPOGRAPHY.h3, textAlign: 'center', marginBottom: SPACING.sm },
    subtitle: { ...TYPOGRAPHY.bodySmall, textAlign: 'center', lineHeight: 20 },
});

export default function MyOrdersScreen() {
    const { currentUser } = useAuth();
    const { colors } = useTheme();
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!currentUser) return;
        setLoading(true);
        const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            const filtered = list.filter(order => {
                const status = order.status?.toLowerCase();
                if (activeTab === 'active') {
                    return status !== 'completed' && status !== 'cancelled';
                }
                return status === 'completed' || status === 'cancelled';
            });
            setOrders(filtered);
            setLoading(false);
        }, (err) => {
            console.error("Orders Load Error:", err);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser, activeTab]);

    const renderOrderItem = ({ item }: { item: Order }) => {
        const firstItem = item.items[0];
        const totalItems = item.items.reduce((sum, i) => sum + i.qty, 0);
        
        const getStatusColor = (status: string) => {
            const s = status.toLowerCase();
            if (s === 'completed') return { bg: '#E8F8EE', text: '#2ECC71' };
            if (s === 'cancelled') return { bg: '#FFF0F0', text: '#FF4D4D' };
            return { bg: '#E8F0FF', text: '#3498DB' };
        };

        const statusStyle = getStatusColor(item.status);

        return (
            <TouchableOpacity 
                style={[styles.orderCard, { backgroundColor: colors.card }]} 
                onPress={() => router.push({ pathname: '/(main)/track-order', params: { orderId: item.id } })}
            >
                <View style={styles.orderLeft}>
                    <Image source={{ uri: firstItem.image }} style={styles.orderImage} />
                </View>
                <View style={styles.orderMid}>
                    <Text style={[styles.orderTitle, { color: colors.text }]} numberOfLines={1}>{firstItem.name}</Text>
                    <Text style={[styles.orderQty, { color: colors.textLight }]}>{totalItems} Items | {item.shippingMethod}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
                        </Text>
                    </View>
                </View>
                <View style={styles.orderRight}>
                    <Text style={[styles.orderPrice, { color: COLORS.primary }]}>${item.total.toFixed(2)}</Text>
                    <TouchableOpacity 
                        style={styles.trackBtn} 
                        onPress={() => router.push({ pathname: '/(main)/track-order', params: { orderId: item.id } })}
                    >
                        <Text style={styles.trackText}>Track</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Ionicons name="leaf" size={28} color={COLORS.primary} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
                <TouchableOpacity onPress={() => router.push('/(main)/explore')}><Ionicons name="search-outline" size={24} color={colors.text} /></TouchableOpacity>
            </View>
            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, activeTab === 'active' && styles.activeTab]} onPress={() => setActiveTab('active')}>
                    <Text style={[styles.tabText, activeTab === 'active' ? styles.activeTabText : { color: colors.textLight }]}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'completed' && styles.activeTab]} onPress={() => setActiveTab('completed')}>
                    <Text style={[styles.tabText, activeTab === 'completed' ? styles.activeTabText : { color: colors.textLight }]}>Completed</Text>
                </TouchableOpacity>
            </View>
            {loading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            ) : (
                <FlatList data={orders} keyExtractor={item => item.id} renderItem={renderOrderItem} contentContainerStyle={styles.list} ListEmptyComponent={<EmptyOrders activeTab={activeTab} colors={colors} />} />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: 12 },
    headerTitle: { ...TYPOGRAPHY.h3, flex: 1 },
    tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border },
    tab: { flex: 1, paddingVertical: SPACING.md, alignItems: 'center' },
    activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
    tabText: { fontSize: 16, fontWeight: '600' },
    activeTabText: { color: COLORS.primary },
    list: { padding: SPACING.lg, paddingBottom: 100 },
    orderCard: { 
        flexDirection: 'row', 
        borderRadius: 16, 
        padding: SPACING.md, 
        marginBottom: SPACING.md, 
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            }
        })
    },
    orderLeft: { marginRight: SPACING.md },
    orderImage: { width: 80, height: 80, borderRadius: 12 },
    orderMid: { flex: 1, justifyContent: 'center' },
    orderTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    orderQty: { fontSize: 12, marginBottom: 8 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
    statusText: { fontSize: 10, fontWeight: '700' },
    orderRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
    orderPrice: { fontSize: 16, fontWeight: '700' },
    trackBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    trackText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
