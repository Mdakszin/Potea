import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, LayoutAnimation, UIManager, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../src/config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TrackOrderScreen() {
    const { orderId } = useLocalSearchParams();
    const [order, setOrder] = useState(null);
    const { colors, isDark } = useTheme();
    const router = useRouter();

    useEffect(() => {
        if (!orderId) return;
        const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (snapshot) => {
            if (snapshot.exists()) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setOrder({ id: snapshot.id, ...snapshot.data() });
            }
        });
        return () => unsubscribe();
    }, [orderId]);

    if (!order) {
        return <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color={COLORS.primary} /></SafeAreaView>;
    }

    const firstItem = order.items?.[0] || {};
    const totalItems = order.items?.reduce((sum, i) => sum + i.qty, 0) || 0;
    const formatTime = (ts) => ts ? (ts.toDate ? ts.toDate() : new Date(ts)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    const formatDate = (ts) => ts ? (ts.toDate ? ts.toDate() : new Date(ts)).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
    const statusIdx = typeof order.status === 'number' ? order.status : 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Track Order</Text>
                <TouchableOpacity><Ionicons name="search" size={24} color={colors.text} /></TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.orderSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Image source={{ uri: firstItem.image }} style={styles.orderImage} />
                    <View style={styles.orderInfo}>
                        <Text style={[styles.plantName, { color: colors.text }]}>{firstItem.name} {order.items?.length > 1 ? `+ ${order.items.length - 1}` : ''}</Text>
                        <Text style={[styles.orderQty, { color: colors.textLight }]}>Total Items: {totalItems}</Text>
                        <Text style={styles.orderPrice}>${order.total.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.trackingVisualizer}>
                    <View style={styles.trackingIconRow}>
                        <View style={styles.iconCircleActive}><Ionicons name="receipt" size={24} color={COLORS.primary} /></View>
                        <View style={[styles.connector, { backgroundColor: statusIdx >= 1 ? COLORS.primary : colors.border }]} />
                        <View style={statusIdx >= 1 ? styles.iconCircleActive : styles.iconCircleInactive}><Ionicons name="cube" size={24} color={statusIdx >= 1 ? COLORS.primary : colors.textLight} /></View>
                        <View style={[styles.connector, { backgroundColor: statusIdx >= 2 ? COLORS.primary : colors.border }]} />
                        <View style={statusIdx >= 2 ? styles.iconCircleActive : styles.iconCircleInactive}><Ionicons name="bicycle" size={24} color={statusIdx >= 2 ? COLORS.primary : colors.textLight} /></View>
                        <View style={[styles.connector, { backgroundColor: statusIdx >= 3 ? COLORS.primary : colors.border }]} />
                        <View style={statusIdx >= 3 ? styles.iconCircleActive : styles.iconCircleInactive}><Ionicons name="checkmark-circle" size={24} color={statusIdx >= 3 ? COLORS.primary : colors.textLight} /></View>
                    </View>
                </View>
                
                <View style={styles.timeline}>
                    {['Order Placed', 'Processing', 'Shipping', 'Delivered'].map((step, i) => (
                        <View key={step} style={styles.timelineItem}>
                            <View style={[styles.indicator, { backgroundColor: statusIdx >= i ? COLORS.primary : colors.border }]} />
                            <View style={styles.timelineContent}>
                                <Text style={[styles.timelineTitle, { color: colors.text }]}>{step}</Text>
                                <Text style={[styles.timelineDesc, { color: colors.textLight }]}>Your order is {step.toLowerCase()}</Text>
                            </View>
                            <View style={styles.timelineTime}><Text style={[styles.timeText, { color: colors.textLight }]}>{statusIdx >= i ? formatTime(order.updatedAt || order.createdAt) : '--:--'}</Text><Text style={[styles.dateText, { color: colors.textLight }]}>{statusIdx >= i ? formatDate(order.updatedAt || order.createdAt) : ''}</Text></View>
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
    iconCircleInactive: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
    connector: { flex: 1, height: 2, marginHorizontal: 4 },
    timeline: { paddingLeft: 8 },
    timelineItem: { flexDirection: 'row', marginBottom: 32 },
    indicator: { width: 6, height: 24, borderRadius: 3, marginRight: 16, marginTop: 4 },
    timelineContent: { flex: 1 },
    timelineTitle: { fontSize: 16, fontWeight: '700' },
    timelineDesc: { fontSize: 12, marginTop: 2 },
    timelineTime: { alignItems: 'flex-end' },
    timeText: { fontSize: 12, fontWeight: '600' },
    dateText: { fontSize: 10, marginTop: 2 },
});
