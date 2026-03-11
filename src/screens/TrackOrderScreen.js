import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Image, ActivityIndicator, LayoutAnimation, UIManager, Platform
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useTheme } from '../contexts/ThemeContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TrackOrderScreen({ route, navigation }) {
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const { colors, isDark } = useTheme();

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
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </SafeAreaView>
        );
    }

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

    const statusIdx = typeof order.status === 'number' ? order.status : 0;
    const statusLabels = ['Order Placed', 'Processing', 'Shipping', 'Delivered'];

    const steps = [
        { title: 'Order Placed', status: statusIdx >= 0 ? 'done' : 'pending', time: statusIdx >= 0 ? formatTime(order.createdAt) : '', date: statusIdx >= 0 ? formatDate(order.createdAt) : '', icon: 'receipt' },
        { title: 'Processing', status: statusIdx >= 1 ? 'done' : 'pending', time: statusIdx >= 1 ? formatTime(order.updatedAt) : '', date: statusIdx >= 1 ? formatDate(order.updatedAt) : '', icon: 'cube' },
        { title: 'Shipping', status: statusIdx >= 2 ? 'done' : 'pending', time: statusIdx >= 2 ? formatTime(order.updatedAt) : '', date: statusIdx >= 2 ? formatDate(order.updatedAt) : '', icon: 'bicycle' },
        { title: 'Delivered', status: statusIdx >= 3 ? 'done' : 'pending', time: statusIdx >= 3 ? formatTime(order.updatedAt) : '', date: statusIdx >= 3 ? formatDate(order.updatedAt) : '', icon: 'checkmark-circle' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Track Order</Text>
                <TouchableOpacity style={styles.headerIcon}>
                    <Ionicons name="search" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Order Summary Card */}
                <View style={[styles.orderSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Image source={{ uri: firstItem.image }} style={[styles.orderImage, { backgroundColor: colors.surface }]} />
                    <View style={styles.orderInfo}>
                        <Text style={[styles.plantName, { color: colors.text }]}>{firstItem.name} {order.items?.length > 1 ? `+ ${order.items.length - 1}` : ''}</Text>
                        <Text style={[styles.orderQty, { color: colors.textLight }]}>Total Items: {totalItems}</Text>
                        <Text style={styles.orderPrice}>${order.total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Tracking Visualizer */}
                <View style={styles.trackingVisualizer}>
                    <View style={styles.trackingIconRow}>
                        <View style={styles.iconCircleActive}>
                            <Ionicons name="receipt" size={24} color={COLORS.primary} />
                        </View>
                        <View style={[statusIdx >= 1 ? styles.connectorActive : styles.connectorInactive, { backgroundColor: statusIdx >= 1 ? COLORS.primary : colors.border }]} />
                        <View style={statusIdx >= 1 ? styles.iconCircleActive : [styles.iconCircleInactive, { backgroundColor: colors.card }]}>
                            <Ionicons name="cube" size={24} color={statusIdx >= 1 ? COLORS.primary : colors.textLight} />
                        </View>
                        <View style={[statusIdx >= 2 ? styles.connectorActive : styles.connectorInactive, { backgroundColor: statusIdx >= 2 ? COLORS.primary : colors.border }]} />
                        <View style={statusIdx >= 2 ? styles.iconCircleActive : [styles.iconCircleInactive, { backgroundColor: colors.card }]}>
                            <Ionicons name="bicycle" size={24} color={statusIdx >= 2 ? COLORS.primary : colors.textLight} />
                        </View>
                        <View style={[statusIdx >= 3 ? styles.connectorActive : styles.connectorInactive, { backgroundColor: statusIdx >= 3 ? COLORS.primary : colors.border }]} />
                        <View style={statusIdx >= 3 ? styles.iconCircleActive : [styles.iconCircleInactive, { backgroundColor: colors.card }]}>
                            <Ionicons name="checkmark-circle" size={24} color={statusIdx >= 3 ? COLORS.primary : colors.textLight} />
                        </View>
                    </View>
                    <Text style={[styles.trackingStatusText, { color: colors.text }]}>{statusLabels[statusIdx]}</Text>
                </View>

                {/* Status Details */}
                <View style={styles.detailsHeader}>
                    <Text style={[styles.detailsTitle, { color: colors.text }]}>Order Status Details</Text>
                </View>

                <View style={styles.timelineContainer}>
                    {steps.map((step, index) => (
                        <View key={index} style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={[styles.timelineDot, { borderColor: colors.background, backgroundColor: colors.border }, step.status === 'done' && styles.dotDone]} />
                                {index < steps.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.border }, steps[index + 1].status === 'done' && styles.lineDone]} />}
                            </View>
                            <View style={styles.timelineContent}>
                                <View style={styles.stepTitleRow}>
                                    <Text style={[styles.stepTitle, { color: colors.text }]}>{step.title}</Text>
                                    <Text style={styles.stepTime}>{step.time} {step.date}</Text>
                                </View>
                                {index === 0 && order.shippingAddress && (
                                    <Text style={[styles.stepLocation, { color: colors.textLight }]}>
                                        {order.shippingAddress.address || order.shippingAddress.street}, {order.shippingAddress.city}
                                    </Text>
                                )}
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
        borderRadius: 24,
        padding: SPACING.lg,
        marginBottom: SPACING.xl,
        borderWidth: 1,
    },
    orderImage: {
        width: 100,
        height: 100,
        borderRadius: 20,
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    connectorActive: {
        width: 30,
        height: 2,
    },
    connectorInactive: {
        width: 30,
        height: 2,
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
        zIndex: 2,
    },
    dotDone: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primaryLight,
    },
    timelineLine: {
        width: 2,
        flex: 1,
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
        lineHeight: 18,
    },
});
