import React from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const NOTIF_DATA = [
    {
        title: 'Today',
        data: [
            { id: '1', icon: 'card-outline', type: 'wallet', title: 'E-Wallet Connected', message: 'E-Wallet has been connected to Potea successfully. You can now make payments.', time: '09:24 AM', isRead: false },
            { id: '2', icon: 'close-circle-outline', type: 'order', title: 'Order Cancelled', message: 'User has been cancelled an order of Cereus Forbesii. Learn why.', time: '08:15 AM', isRead: false },
        ]
    },
    {
        title: 'Yesterday',
        data: [
            { id: '3', icon: 'star-outline', type: 'promo', title: '30% Special Discount!', message: 'Special promotion only for today. Get 30% discount for all plants.', time: '05:40 PM', isRead: true },
        ]
    },
    {
        title: 'Dec 19, 2024',
        data: [
            { id: '4', icon: 'cube-outline', type: 'order', title: 'Order Successful', message: 'Your order of Prayer Plant has been placed successfully.', time: '11:20 AM', isRead: true },
        ]
    }
];

const getIconColor = (type) => {
    switch (type) {
        case 'wallet': return '#246BFD';
        case 'order': return COLORS.primary;
        case 'promo': return '#FFB800';
        default: return COLORS.primary;
    }
};

export default function NotificationsScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notifications</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-horizontal-circle" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <SectionList
                sections={NOTIF_DATA}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} activeOpacity={0.7}>
                        <View style={[styles.iconCircle, { backgroundColor: getIconColor(item.type) + '15' }]}>
                            <Ionicons name={item.icon} size={24} color={getIconColor(item.type)} />
                        </View>
                        <View style={styles.cardContent}>
                            <View style={styles.titleRow}>
                                <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
                                <Text style={styles.time}>{item.time}</Text>
                            </View>
                            <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
                        </View>
                        {!item.isRead && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                )}
                stickySectionHeadersEnabled={false}
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
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    backBtn: { marginRight: SPACING.md },
    headerTitle: { ...TYPOGRAPHY.h2 },
    list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
    sectionHeader: { ...TYPOGRAPHY.h3, marginTop: SPACING.lg, marginBottom: SPACING.lg },
    card: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.white, paddingVertical: SPACING.md,
        marginBottom: 4,
    },
    iconCircle: {
        width: 52, height: 52, borderRadius: 26,
        alignItems: 'center', justifyContent: 'center',
        marginRight: SPACING.md,
    },
    cardContent: { flex: 1 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    notifTitle: { ...TYPOGRAPHY.body, fontWeight: '700', flex: 1, marginRight: 8 },
    time: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, fontSize: 10 },
    notifMessage: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, lineHeight: 18 },
    unreadDot: {
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: COLORS.primary, marginLeft: SPACING.sm,
    },
});
