import React from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

interface NotificationItem {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    type: 'wallet' | 'order' | 'promo';
    title: string;
    message: string;
    time: string;
    isRead: boolean;
}

interface NotificationSection {
    title: string;
    data: NotificationItem[];
}

const NOTIF_DATA: NotificationSection[] = [
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
    }
];

const getIconColor = (type: NotificationItem['type']) => {
    switch (type) {
        case 'wallet': return '#246BFD';
        case 'order': return COLORS.primary;
        case 'promo': return '#FFB800';
        default: return COLORS.primary;
    }
};

export default function NotificationsScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                </View>
                <TouchableOpacity><Ionicons name="ellipsis-horizontal-circle" size={24} color={colors.text} /></TouchableOpacity>
            </View>

            <SectionList
                sections={NOTIF_DATA}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={[styles.sectionHeader, { color: colors.text }]}>{title}</Text>
                )}
                renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.card, { backgroundColor: colors.background }]} activeOpacity={0.7}>
                        <View style={[styles.iconCircle, { backgroundColor: getIconColor(item.type) + '15' }]}><Ionicons name={item.icon} size={24} color={getIconColor(item.type)} /></View>
                        <View style={styles.cardContent}>
                            <View style={styles.titleRow}>
                                <Text style={[styles.notifTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                                <Text style={[styles.time, { color: colors.textLight }]}>{item.time}</Text>
                            </View>
                            <Text style={[styles.notifMessage, { color: colors.textLight }]} numberOfLines={2}>{item.message}</Text>
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
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    backBtn: { marginRight: SPACING.md },
    headerTitle: { fontSize: 24, fontWeight: '700' },
    list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
    sectionHeader: { fontSize: 18, fontWeight: '700', marginTop: SPACING.lg, marginBottom: SPACING.lg },
    card: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, marginBottom: 4 },
    iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
    cardContent: { flex: 1 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    notifTitle: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
    time: { fontSize: 12 },
    notifMessage: { fontSize: 14, lineHeight: 18 },
    unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary, marginLeft: 8 },
});
