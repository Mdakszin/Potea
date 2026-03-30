import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, LayoutAnimation, UIManager, Platform } from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../src/config/firebase';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Order, OrderItem, OrderStatus } from '../../src/types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ORDER_STEPS: OrderStatus[] = ['placed', 'processing', 'shipping', 'delivered'];

export default function TrackOrderScreen() {
    const { orderId } = useLocalSearchParams();
    const [order, setOrder] = useState<Order | null>(null);
    const { colors } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId || typeof orderId !== 'string') {
            setError('Invalid Order ID');
            setLoading(false);
            return;
        }

        const unsubscribe = onSnapshot(
            doc(db, 'orders', orderId), 
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    // Only animate if status or data changes
                    if (JSON.stringify(data) !== JSON.stringify(order)) {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    }
                    setOrder({ id: snapshot.id, ...data } as Order);
                    setError(null);
                } else {
                    setError('Order not found');
                }
                setLoading(false);
            },
            (err) => {
                console.error("Track Order Error:", err);
                setError('Failed to load order details');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [orderId]);

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

    if (error || !order) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
                <Text style={[styles.errorText, { color: colors.text, marginTop: 16 }]}>{error || 'Something went wrong'}</Text>
                <TouchableOpacity 
                    style={[styles.backButton, { backgroundColor: COLORS.primary }]}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const firstItem = order.items?.[0] as OrderItem || {} as OrderItem;
    const totalItems = order.items?.reduce((sum, i) => sum + i.qty, 0) || 0;
    
    const getStatusIndex = (status: OrderStatus | number) => {
        if (typeof status === 'number') return status;
        return ORDER_STEPS.indexOf(status);
    };

    const statusIdx = getStatusIndex(order.status);
    
    const formatTime = (ts: Timestamp | any) => ts ? (ts.toDate ? ts.toDate() : new Date(ts)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const formatDate = (ts: Timestamp | any) => ts ? (ts.toDate ? ts.toDate() : new Date(ts)).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Track Order</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.orderSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Image source={{ uri: firstItem.image }} style={styles.orderImage} />
                    <View style={styles.orderInfo}>
                        <Text style={[styles.plantName, { color: colors.text }]}>
                            {firstItem.name} {order.items?.length > 1 ? `+ ${order.items.length - 1}` : ''}
                        </Text>
                        <Text style={[styles.orderQty, { color: colors.textLight }]}>Total Items: {totalItems}</Text>
                        <Text style={styles.orderPrice}>${order.total.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.trackingVisualizer}>
                    <View style={styles.trackingIconRow}>
                        <View style={statusIdx >= 0 ? styles.iconCircleActive : [styles.iconCircleInactive, { backgroundColor: colors.card }]}>
                            <Ionicons name="receipt" size={24} color={statusIdx >= 0 ? COLORS.primary : colors.textLight} />
                        </View>
                        <View style={[styles.connector, { backgroundColor: statusIdx >= 1 ? COLORS.primary : colors.border }]} />
                        <View style={statusIdx >= 1 ? styles.iconCircleActive : [styles.iconCircleInactive, { backgroundColor: colors.card }]}>
                            <Ionicons name="cube" size={24} color={statusIdx >= 1 ? COLORS.primary : colors.textLight} />
                        </View>
                        <View style={[styles.connector, { backgroundColor: statusIdx >= 2 ? COLORS.primary : colors.border }]} />
                        <View style={statusIdx >= 2 ? styles.iconCircleActive : [styles.iconCircleInactive, { backgroundColor: colors.card }]}>
                            <Ionicons name="bicycle" size={24} color={statusIdx >= 2 ? COLORS.primary : colors.textLight} />
                        </View>
                        <View style={[styles.connector, { backgroundColor: statusIdx >= 3 ? COLORS.primary : colors.border }]} />
                        <View style={statusIdx >= 3 ? styles.iconCircleActive : [styles.iconCircleInactive, { backgroundColor: colors.card }]}>
                            <Ionicons name="checkmark-circle" size={24} color={statusIdx >= 3 ? COLORS.primary : colors.textLight} />
                        </View>
                    </View>
                </View>

                <View style={styles.timeline}>
                    {ORDER_STEPS.map((step, i) => (
                        <View key={step} style={styles.timelineItem}>
                            <View style={styles.indicatorContainer}>
                                <View style={[styles.indicator, { backgroundColor: statusIdx >= i ? COLORS.primary : colors.border }]} />
                                {i < ORDER_STEPS.length - 1 && (
                                    <View style={[styles.verticalLine, { backgroundColor: statusIdx > i ? COLORS.primary : colors.border }]} />
                                )}
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={[styles.timelineTitle, { color: colors.text }]}>
                                    {step.charAt(0).toUpperCase() + step.slice(1).replace('-', ' ')}
                                </Text>
                                <Text style={[styles.timelineDesc, { color: colors.textLight }]}>
                                    {statusIdx >= i ? `Order is successfully ${step}` : `Pending ${step}`}
                                </Text>
                            </View>
                            <View style={styles.timelineTime}>
                                <Text style={[styles.timeText, { color: colors.textLight }]}>
                                    {statusIdx >= i ? formatTime(order.updatedAt || order.createdAt) : '--:--'}
                                </Text>
                                <Text style={[styles.dateText, { color: colors.textLight }]}>
                                    {statusIdx >= i ? formatDate(order.updatedAt || order.createdAt) : ''}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
    headerTitle: { fontSize: 24, fontWeight: '700' },
    scrollContent: { padding: SPACING.lg },
    orderSummaryCard: { flexDirection: 'row', borderRadius: 24, padding: 16, borderWidth: 1, marginBottom: 24 },
    orderImage: { width: 100, height: 100, borderRadius: 20 },
    orderInfo: { flex: 1, marginLeft: 16 },
    plantName: { fontSize: 18, fontWeight: '700' },
    orderQty: { fontSize: 12, marginVertical: 4 },
    orderPrice: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
    trackingVisualizer: { marginBottom: 32 },
    trackingIconRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    iconCircleActive: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center' },
    iconCircleInactive: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
    connector: { flex: 1, height: 2, marginHorizontal: 4 },
    timeline: { paddingLeft: 8 },
    timelineItem: { flexDirection: 'row', marginBottom: 24, height: 60 },
    indicatorContainer: { alignItems: 'center', marginRight: 20 },
    indicator: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
    verticalLine: { width: 2, height: '100%', position: 'absolute', top: 12 },
    timelineContent: { flex: 1 },
    timelineTitle: { fontSize: 16, fontWeight: '700' },
    timelineDesc: { fontSize: 12, marginTop: 4 },
    timelineTime: { alignItems: 'flex-end' },
    timeText: { fontSize: 12, fontWeight: '600' },
    dateText: { fontSize: 10, marginTop: 2 },
    errorText: { fontSize: 18, fontWeight: '600' },
    backButton: { marginTop: 24, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 100 },
    backButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});
