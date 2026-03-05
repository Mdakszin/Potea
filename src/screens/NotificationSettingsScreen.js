import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

export default function NotificationSettingsScreen({ navigation }) {
    const [settings, setSettings] = useState({
        general: true,
        sound: true,
        vibrate: false,
        special: true,
        promo: false,
        payments: true,
        cashout: true,
        updates: true,
        newService: false,
        tips: false,
    });

    const toggleSwitch = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Notification</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {NOTIF_OPTIONS.map(opt => (
                    <View key={opt.id} style={styles.settingItem}>
                        <Text style={styles.settingLabel}>{opt.label}</Text>
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
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    backBtn: { padding: 4 },
    title: { ...TYPOGRAPHY.h3 },
    scrollContent: { padding: SPACING.lg },
    settingItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        marginVertical: 4,
    },
    settingLabel: { ...TYPOGRAPHY.body, fontWeight: '600', color: COLORS.text },
});
