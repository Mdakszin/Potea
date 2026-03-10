import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import LayoutContainer from '../components/LayoutContainer';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const MENU_ITEMS = [
    { id: '0', icon: 'document-text-outline', label: 'My Orders', target: 'Orders' },
    { id: '1', icon: 'person-outline', label: 'Edit Profile', target: 'EditProfile' },
    { id: '2', icon: 'wallet-outline', label: 'My E-Wallet', target: 'Wallet' },
    { id: '11', icon: 'heart-outline', label: 'Wishlist', target: 'Wishlist' },
    { id: '3', icon: 'notifications-outline', label: 'Notifications', target: 'NotificationSettings' },
    { id: '4', icon: 'location-outline', label: 'Address', target: 'Address' },
    { id: '5', icon: 'lock-closed-outline', label: 'Security', target: 'Security' },
    { id: '6', icon: 'language-outline', label: 'Language', target: 'Language' },
    { id: '7', icon: 'eye-outline', label: 'Dark Mode', isToggle: true },
    { id: '8', icon: 'shield-checkmark-outline', label: 'Privacy Policy', target: 'PrivacyPolicy' },
    { id: '9', icon: 'help-circle-outline', label: 'Help Center', target: 'HelpCenter' },
    { id: '10', icon: 'people-outline', label: 'Invite Friends', target: 'InviteFriends' },
];

export default function ProfileScreen({ navigation }) {
    const { currentUser, userData, logout } = useAuth();
    const { isDark, colors, toggleTheme } = useTheme();

    // Resolve display values
    const displayName = userData?.name || currentUser?.displayName || 'User';
    const displayEmail = userData?.email || currentUser?.email || '';
    const avatarUri = userData?.avatar
        || currentUser?.photoURL
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=${isDark ? '1F222A' : '4CAF50'}&color=fff&size=200`;

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <LayoutContainer>
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>My Profile</Text>
                    </View>

                    {/* Avatar & Info */}
                    <View style={styles.profileSection}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={{ uri: avatarUri }}
                                style={styles.avatar}
                            />
                            <TouchableOpacity
                                style={[styles.editBadge, { borderColor: colors.background }]}
                                onPress={() => navigation.navigate('EditProfile')}
                            >
                                <Ionicons name="pencil" size={14} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
                        <Text style={[styles.email, { color: colors.textLight }]}>{displayEmail}</Text>
                    </View>

                    {/* Menu items */}
                    <View style={styles.menuContainer}>
                        {MENU_ITEMS.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={() => {
                                    if (item.isToggle) {
                                        toggleTheme();
                                    } else if (item.target) {
                                        navigation.navigate(item.target);
                                    }
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
                                    ) : (
                                        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}

                        {/* Logout */}
                        <TouchableOpacity
                            style={[styles.menuItem, { borderBottomWidth: 0 }]}
                            onPress={handleLogout}
                        >
                            <View style={styles.menuLeft}>
                                <Ionicons name="log-out-outline" size={24} color="#FF4D4D" />
                                <Text style={[styles.menuLabel, { color: '#FF4D4D' }]}>Logout</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LayoutContainer>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1 },
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
        alignItems: 'center', justifyContent: 'center', borderWidth: 3,
    },
    name: { ...TYPOGRAPHY.h2, marginBottom: 4 },
    email: { ...TYPOGRAPHY.bodySmall, fontWeight: '600' },
    menuContainer: {
        paddingHorizontal: SPACING.lg,
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: SPACING.lg,
    },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    menuRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    menuLabel: { ...TYPOGRAPHY.body, fontWeight: '600' },
    menuValue: { ...TYPOGRAPHY.body, fontWeight: '600', marginRight: 8 },
    toggle: {
        width: 44, height: 24, borderRadius: 12, padding: 2,
        justifyContent: 'center',
    },
    toggleCircle: {
        width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.white,
    }
});
