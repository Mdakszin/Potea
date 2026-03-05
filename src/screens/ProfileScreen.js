import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

const MENU_ITEMS = [
    { id: '0', icon: 'document-text-outline', label: 'My Orders', target: 'Orders' },
    { id: '1', icon: 'person-outline', label: 'Edit Profile' },
    { id: '2', icon: 'wallet-outline', label: 'My E-Wallet', target: 'Wallet' },
    { id: '3', icon: 'notifications-outline', label: 'Notifications', target: 'Notifications' },
    { id: '4', icon: 'card-outline', label: 'Payment Methods' },
    { id: '5', icon: 'help-circle-outline', label: 'Help & Support' },
    { id: '6', icon: 'settings-outline', label: 'Settings' },
];

export default function ProfileScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.title}>My Profile</Text>
                </View>

                {/* Avatar & Info */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editBadge}>
                            <Ionicons name="pencil" size={14} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.name}>Andrew Ainsley</Text>
                    <Text style={styles.email}>andrew_ainsley@yourdomain.com</Text>
                </View>

                {/* Menu items */}
                <View style={styles.menuContainer}>
                    {MENU_ITEMS.map((item, idx) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={() => item.target && navigation.navigate(item.target)}
                        >
                            <View style={styles.menuLeft}>
                                <Ionicons name={item.icon} size={24} color={COLORS.text} />
                                <Text style={styles.menuLabel}>{item.label}</Text>
                            </View>
                            <View style={styles.menuRight}>
                                {item.label === 'Language' && <Text style={styles.menuValue}>English (US)</Text>}
                                <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Logout with special color */}
                    <TouchableOpacity
                        style={[styles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={() => navigation.replace('LetsYouIn')}
                    >
                        <View style={styles.menuLeft}>
                            <Ionicons name="log-out-outline" size={24} color="#FF4D4D" />
                            <Text style={[styles.menuLabel, { color: '#FF4D4D' }]}>Logout</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    headerBtn: { padding: 4 },
    title: { ...TYPOGRAPHY.h2 },
    scrollContent: { paddingBottom: SPACING.xxl },
    profileSection: { alignItems: 'center', paddingVertical: SPACING.xl },
    avatarWrapper: { position: 'relative', marginBottom: SPACING.md },
    avatar: { width: 120, height: 120, borderRadius: 60 },
    editBadge: {
        position: 'absolute', bottom: 4, right: 4,
        backgroundColor: COLORS.primary, width: 30, height: 30, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.white,
    },
    name: { ...TYPOGRAPHY.h2, marginBottom: 4 },
    email: { ...TYPOGRAPHY.bodySmall, color: COLORS.text, fontWeight: '600' },
    menuContainer: {
        paddingHorizontal: SPACING.lg,
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: SPACING.lg,
    },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    menuRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    menuLabel: { ...TYPOGRAPHY.body, fontWeight: '600', color: COLORS.text },
    menuValue: { ...TYPOGRAPHY.body, fontWeight: '600', color: COLORS.text },
});
