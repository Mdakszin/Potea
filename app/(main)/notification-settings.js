import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

const NOTIF_OPTIONS = [
    { id: '1', label: 'General Notification', key: 'general' },
    { id: '2', label: 'Sound', key: 'sound' },
    { id: '3', label: 'Vibrate', key: 'vibrate' },
    { id: '4', label: 'Special Offers', key: 'special' },
    { id: '5', label: 'Promo & Discount', key: 'promo' },
    { id: '6', label: 'Payments', key: 'payments' },
    { id: '7', label: 'Cashout', key: 'cashout' },
    { id: '8', label: 'App Updates', key: 'updates' },
    { id: '9', label: 'New Service Available', key: 'newService' },
    { id: '10', label: 'New Tips Available', key: 'tips' },
];

export default function NotificationSettingsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [settings, setSettings] = useState({
        general: true, sound: true, vibrate: false, special: true, promo: false,
        payments: true, cashout: true, updates: true, newService: false, tips: false,
    });

    const toggleSwitch = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Notification</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {NOTIF_OPTIONS.map(opt => (
                    <View key={opt.id} style={styles.settingItem}>
                        <Text style={[styles.settingLabel, { color: colors.text }]}>{opt.label}</Text>
                        <Switch
                            trackColor={{ false: '#EEEEEE', true: COLORS.primary }}
                            thumbColor={COLORS.white}
                            ios_backgroundColor="#EEEEEE"
                            onValueChange={() => toggleSwitch(opt.key)}
                            value={settings[opt.key]}
                        />
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    title: { fontSize: 18, fontWeight: '700' },
    scrollContent: { padding: SPACING.lg },
    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.md, marginVertical: 4 },
    settingLabel: { fontSize: 16, fontWeight: '600' },
});
