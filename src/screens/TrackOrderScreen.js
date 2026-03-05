import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Image
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const TRACKING_STEPS = [
    {
        title: 'Order In Transit - Dec 17',
        time: '12:30 PM',
        location: '32 Manchester Ave. Ringgold, GA 30736',
        status: 'done',
    },
    {
        title: 'Order .. Customs Port - Dec 16',
        time: '11:40 PM',
        location: '4 Evergreen Street, Lake Zurich, IL 60047',
        status: 'done',
    },
    {
        title: 'Orders are .. Shipped - Dec 15',
        time: '11:30 AM',
        location: '917 Hillcrest Street, Wheeling, WV 26003',
        status: 'done',
    },
    {
        title: 'Order is in Packing - Dec 15',
        time: '10:25 AM',
        location: '891 Glen Ridge St. Gainesville, VA 20155',
        status: 'done',
    },
    {
        title: 'Verified Payments - Dec 15',
        time: '10:04 AM',
        location: '55 Summerhouse Dr. Apopka, FL 32703',
        status: 'done',
    },
];

export default function TrackOrderScreen({ route, navigation }) {
    const { order } = route.params;

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
                    <Image source={{ uri: order.plant.image }} style={styles.orderImage} />
                    <View style={styles.orderInfo}>
                        <Text style={styles.plantName}>{order.plant.name}</Text>
                        <Text style={styles.orderQty}>Qty: {order.qty}</Text>
                        <Text style={styles.orderPrice}>${order.price.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Tracking Visualizer */}
                <View style={styles.trackingVisualizer}>
                    <View style={styles.trackingIconRow}>
                        <View style={styles.iconCircleActive}>
                            <Ionicons name="cube" size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.connectorActive} />
                        <View style={styles.iconCircleActive}>
                            <Ionicons name="bicycle" size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.connectorInactive} />
                        <View style={styles.iconCircleInactive}>
                            <Ionicons name="people" size={24} color={COLORS.textLight} />
                        </View>
                        <View style={styles.connectorInactive} />
                        <View style={styles.iconCircleInactive}>
                            <Ionicons name="checkmark-circle" size={24} color={COLORS.textLight} />
                        </View>
                    </View>
                    <Text style={styles.trackingStatusText}>Packet In Delivery</Text>
                </View>

                {/* Status Details */}
                <View style={styles.detailsHeader}>
                    <Text style={styles.detailsTitle}>Order Status Details</Text>
                </View>

                <View style={styles.timelineContainer}>
                    {TRACKING_STEPS.map((step, index) => (
                        <View key={index} style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={[styles.timelineDot, styles.dotDone]} />
                                {index < TRACKING_STEPS.length - 1 && <View style={[styles.timelineLine, styles.lineDone]} />}
                            </View>
                            <View style={styles.timelineContent}>
                                <View style={styles.stepTitleRow}>
                                    <Text style={styles.stepTitle}>{step.title}</Text>
                                    <Text style={styles.stepTime}>{step.time}</Text>
                                </View>
                                <Text style={styles.stepLocation}>{step.location}</Text>
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
