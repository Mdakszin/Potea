import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function SecurityScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [fingerprint, setFingerprint] = useState(false);
    const [faceId, setFaceId] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Security</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.settingItem}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Remember me</Text>
                    <Switch 
                        trackColor={{ false: '#EEEEEE', true: COLORS.primary }} 
                        thumbColor={COLORS.white} 
                        ios_backgroundColor="#EEEEEE" 
                        value={true} 
                    />
                </View>
                <View style={styles.settingItem}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Biometric ID</Text>
                    <Switch 
                        trackColor={{ false: '#EEEEEE', true: COLORS.primary }} 
                        thumbColor={COLORS.white} 
                        ios_backgroundColor="#EEEEEE" 
                        onValueChange={setFingerprint} 
                        value={fingerprint} 
                    />
                </View>
                <View style={styles.settingItem}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Face ID</Text>
                    <Switch 
                        trackColor={{ false: '#EEEEEE', true: COLORS.primary }} 
                        thumbColor={COLORS.white} 
                        ios_backgroundColor="#EEEEEE" 
                        onValueChange={setFaceId} 
                        value={faceId} 
                    />
                </View>
                <View style={styles.settingItem}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>SMS Authenticator</Text>
                    <Switch 
                        trackColor={{ false: '#EEEEEE', true: COLORS.primary }} 
                        thumbColor={COLORS.white} 
                        ios_backgroundColor="#EEEEEE" 
                        onValueChange={setTwoFactor} 
                        value={twoFactor} 
                    />
                </View>
                <TouchableOpacity style={styles.btnRow}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>Google Authenticator</Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnRow}>
                    <Text style={[styles.btnLabel, { color: colors.text }]}>Change PIN</Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnRow}>
                    <Text style={[styles.btnLabel, { color: colors.text }]}>Change Password</Text>
                    <Ionicons name="chevron-forward" size={24} color={colors.text} />
                </TouchableOpacity>
            </ScrollView>
            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <Button title="Save Settings" onPress={() => router.back()} style={{ width: '100%' }} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    title: { fontSize: 24, fontWeight: '700' },
    scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.lg },
    settingLabel: { fontSize: 16, fontWeight: '600' },
    btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.lg },
    btnLabel: { fontSize: 16, fontWeight: '600' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl, borderTopWidth: 1 },
});
