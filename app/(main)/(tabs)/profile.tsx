import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LayoutContainer from '../../../src/components/LayoutContainer';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

interface MenuItem {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    target?: string;
    isToggle?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
    { id: '0', icon: 'document-text-outline', label: 'My Orders', target: '/(main)/(tabs)/orders' },
    { id: '1', icon: 'person-outline', label: 'Edit Profile', target: '/(main)/edit-profile' },
    { id: '2', icon: 'wallet-outline', label: 'My E-Wallet', target: '/(main)/(tabs)/wallet' },
    { id: '13', icon: 'leaf-outline', label: 'My Garden', target: '/(main)/my-garden' },
    { id: '11', icon: 'heart-outline', label: 'Wishlist', target: '/(main)/my-favorites' },
    { id: '3', icon: 'notifications-outline', label: 'Notifications', target: '/(main)/notification-settings' },
    { id: '4', icon: 'location-outline', label: 'Address', target: '/(main)/address' },
    { id: '5', icon: 'lock-closed-outline', label: 'Security', target: '/(main)/security' },
    { id: '6', icon: 'language-outline', label: 'Language', target: '/(main)/language' },
    { id: '7', icon: 'eye-outline', label: 'Dark Mode', isToggle: true },
    { id: '8', icon: 'shield-checkmark-outline', label: 'Privacy Policy', target: '/(main)/privacy-policy' },
    { id: '9', icon: 'help-circle-outline', label: 'Help Center', target: '/(main)/help-center' },
    { id: '12', icon: 'information-circle-outline', label: 'About Potea', target: '/(main)/about-potea' },
    { id: '10', icon: 'people-outline', label: 'Invite Friends', target: '/(main)/invite-friends' },
];

export default function ProfileScreen() {
    const { currentUser, userData, logout } = useAuth();
    const { isDark, colors, toggleTheme } = useTheme();
    const router = useRouter();
    const [logoutModal, setLogoutModal] = useState(false);

    const displayName = userData?.name || currentUser?.displayName || 'User';
    const displayEmail = userData?.email || currentUser?.email || '';
    const avatarUri = userData?.avatar
        || currentUser?.photoURL
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${isDark ? '1F222A' : '4CAF50'}&color=fff&size=200`;

    const handleLogout = async () => {
        setLogoutModal(false);
        try {
            await logout();
            router.replace('/(auth)/welcome');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <LayoutContainer>
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    <View style={styles.header}>
                        <Ionicons name="leaf" size={28} color={COLORS.primary} style={{ marginRight: 12 }} />
                        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
                    </View>

                    <View style={styles.profileSection}>
                        <View style={styles.avatarWrapper}>
                            <Image source={{ uri: avatarUri }} style={styles.avatar} />
                            <TouchableOpacity style={styles.editBadge} onPress={() => router.push('/(main)/edit-profile')}>
                                <Ionicons name="pencil" size={14} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
                        <Text style={[styles.email, { color: colors.textLight }]}>{displayEmail}</Text>
                    </View>

                    <View style={styles.menuContainer}>
                        {MENU_ITEMS.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={() => {
                                    if (item.isToggle) toggleTheme();
                                    else if (item.target) router.push(item.target as any);
                                }}
                            >
                                <View style={styles.menuLeft}>
                                    <Ionicons name={item.icon} size={24} color={colors.text} />
                                    <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                                </View>
                                <View style={styles.menuRight}>
                                    {item.label === 'Language' && <Text style={[styles.menuValue, { color: colors.text }]}>English (US)</Text>}
                                    {item.isToggle ? (
                                        <View style={[styles.toggle, { backgroundColor: isDark ? COLORS.primary : COLORS.border }]}>
                                            <View style={[styles.toggleCircle, { alignSelf: isDark ? 'flex-end' : 'flex-start' }]} />
                                        </View>
                                    ) : <Ionicons name="chevron-forward" size={20} color={colors.textLight} />}
                                </View>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.menuItem} onPress={() => setLogoutModal(true)}>
                            <View style={styles.menuLeft}>
                                <Ionicons name="log-out-outline" size={24} color="#FF4D4D" />
                                <Text style={[styles.menuLabel, { color: "#FF4D4D" }]}>Logout</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LayoutContainer>

            <Modal transparent visible={logoutModal} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <Text style={[styles.modalTitle, { color: "#FF4D4D" }]}>Logout</Text>
                        <Text style={[styles.modalText, { color: colors.text }]}>Are you sure you want to log out?</Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.card }]} onPress={() => setLogoutModal(false)}>
                                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.primary }]} onPress={handleLogout}>
                                <Text style={[styles.modalBtnText, { color: COLORS.white }]}>Yes, Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg },
    title: { fontSize: 24, fontWeight: '700' },
    profileSection: { alignItems: 'center', marginVertical: SPACING.xl },
    avatarWrapper: { position: 'relative', marginBottom: SPACING.md },
    avatar: { width: 120, height: 120, borderRadius: 60 },
    editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.white },
    name: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
    email: { fontSize: 14 },
    menuContainer: { paddingHorizontal: SPACING.lg },
    menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.md },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    menuLabel: { fontSize: 18, fontWeight: '600' },
    menuRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    menuValue: { fontSize: 16, fontWeight: '600' },
    toggle: { width: 44, height: 24, borderRadius: 12, padding: 2 },
    toggleCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.white },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    modalContent: { width: '100%', borderRadius: 24, padding: 24, alignItems: 'center' },
    modalTitle: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
    modalText: { fontSize: 18, textAlign: 'center', marginBottom: 24 },
    modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
    modalBtn: { flex: 1, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
    modalBtnText: { fontSize: 16, fontWeight: '700' },
});
