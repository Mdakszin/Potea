import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Image, ActivityIndicator
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function TrackOrderScreen({ route, navigation }) {
    const { order: initialOrder } = route.params;
    const [order, setOrder] = useState(initialOrder);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!initialOrder?.id) return;

        const unsubscribe = onSnapshot(doc(db, 'orders', initialOrder.id), (snapshot) => {
            if (snapshot.exists()) {
                setOrder({ id: snapshot.id, ...snapshot.data() });
            }
        });

        return () => unsubscribe();
    }, [initialOrder.id]);

    const firstItem = order.items?.[0] || {};
    const totalItems = order.items?.reduce((sum, i) => sum + i.qty, 0) || 0;

    // Helper to format timestamps
    const formatTime = (ts) => {
        if (!ts) return '';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (ts) => {
        if (!ts) return '';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const getStatusIndex = (status) => {
        const statuses = ['Processing', 'Packed', 'Shipping', 'Delivered'];
        return statuses.indexOf(status);
    };

    const statusIdx = getStatusIndex(order.status);

    const steps = [
        { title: 'Order Placed', status: 'done', time: formatTime(order.createdAt), date: formatDate(order.createdAt), icon: 'receipt' },
        { title: 'Processing', status: statusIdx >= 0 ? 'done' : 'pending', time: '', date: '', icon: 'cube' },
        { title: 'Shipping', status: statusIdx >= 2 ? 'done' : 'pending', time: '', date: '', icon: 'bicycle' },
        { title: 'Delivered', status: statusIdx >= 3 ? 'done' : 'pending', time: '', date: '', icon: 'checkmark-circle' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Track Order</Text>
                <TouchableOpacity style={styles.headerIcon}>
                    <Ionicons name="search" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Order Summary Card */}
                <View style={styles.orderSummaryCard}>
                    <Image source={{ uri: firstItem.image }} style={styles.orderImage} />
                    <View style={styles.orderInfo}>
                        <Text style={styles.plantName}>{firstItem.name} {order.items?.length > 1 ? `+ ${order.items.length - 1}` : ''}</Text>
                        <Text style={styles.orderQty}>Total Items: {totalItems}</Text>
                        <Text style={styles.orderPrice}>${order.total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Tracking Visualizer */}
                <View style={styles.trackingVisualizer}>
                    <View style={styles.trackingIconRow}>
                        <View style={styles.iconCircleActive}>
                            <Ionicons name="receipt" size={24} color={COLORS.primary} />
                        </View>
                        <View style={statusIdx >= 0 ? styles.connectorActive : styles.connectorInactive} />
                        <View style={statusIdx >= 0 ? styles.iconCircleActive : styles.iconCircleInactive}>
                            <Ionicons name="cube" size={24} color={statusIdx >= 0 ? COLORS.primary : COLORS.textLight} />
                        </View>
                        <View style={statusIdx >= 2 ? styles.connectorActive : styles.connectorInactive} />
                        <View style={statusIdx >= 2 ? styles.iconCircleActive : styles.iconCircleInactive}>
                            <Ionicons name="bicycle" size={24} color={statusIdx >= 2 ? COLORS.primary : COLORS.textLight} />
                        </View>
                        <View style={statusIdx >= 3 ? styles.connectorActive : styles.connectorInactive} />
                        <View style={statusIdx >= 3 ? styles.iconCircleActive : styles.iconCircleInactive}>
                            <Ionicons name="checkmark-circle" size={24} color={statusIdx >= 3 ? COLORS.primary : COLORS.textLight} />
                        </View>
                    </View>
                    <Text style={styles.trackingStatusText}>{order.status}</Text>
                </View>

                {/* Status Details */}
                <View style={styles.detailsHeader}>
                    <Text style={styles.detailsTitle}>Order Status Details</Text>
                </View>

                <View style={styles.timelineContainer}>
                    {steps.map((step, index) => (
                        <View key={index} style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={[styles.timelineDot, step.status === 'done' && styles.dotDone]} />
                                {index < steps.length - 1 && <View style={[styles.timelineLine, steps[index + 1].status === 'done' && styles.lineDone]} />}
                            </View>
                            <View style={styles.timelineContent}>
                                <View style={styles.stepTitleRow}>
                                    <Text style={styles.stepTitle}>{step.title}</Text>
                                    <Text style={styles.stepTime}>{step.time} {step.date}</Text>
                                </View>
                                {index === 0 && <Text style={styles.stepLocation}>{order.shippingAddress.address}, {order.shippingAddress.city}</Text>}
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
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
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
    },
    headerIcon: {
        padding: 4,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    orderSummaryCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
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
        justifyContent: 'center',
    },
    plantName: {
        ...TYPOGRAPHY.h3,
        marginBottom: 4,
    },
    orderQty: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textLight,
        marginBottom: 8,
    },
    orderPrice: {
        ...TYPOGRAPHY.h3,
        color: COLORS.primary,
    },
    trackingVisualizer: {
        alignItems: 'center',
        marginBottom: SPACING.xxl,
    },
    trackingIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    iconCircleActive: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primaryLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconCircleInactive: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    connectorActive: {
        width: 30,
        height: 2,
        backgroundColor: COLORS.primary,
    },
    connectorInactive: {
        width: 30,
        height: 2,
        backgroundColor: COLORS.border,
    },
    trackingStatusText: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
    },
    detailsHeader: {
        marginBottom: SPACING.xl,
    },
    detailsTitle: {
        ...TYPOGRAPHY.h3,
    },
    timelineContainer: {
        paddingLeft: SPACING.sm,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    timelineLeft: {
        alignItems: 'center',
        width: 30,
    },
    timelineDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 4,
        borderColor: COLORS.white,
        backgroundColor: COLORS.border,
        zIndex: 2,
    },
    dotDone: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primaryLight,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: COLORS.border,
        marginTop: -4,
        marginBottom: -4,
    },
    lineDone: {
        backgroundColor: COLORS.primary,
    },
    timelineContent: {
        flex: 1,
        marginLeft: SPACING.md,
        paddingBottom: SPACING.xxl,
    },
    stepTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    stepTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '700',
    },
    stepTime: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textLight,
    },
    stepLocation: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textLight,
        lineHeight: 18,
    },
});
