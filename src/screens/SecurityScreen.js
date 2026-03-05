import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

export default function SecurityScreen({ navigation }) {
    const [pin, setPin] = useState(true);
    const [fingerprint, setFingerprint] = useState(false);
    const [faceId, setFaceId] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Security</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Remember me</Text>
                    <Switch
                        trackColor={{ false: '#EEEEEE', true: COLORS.primary }}
                        thumbColor={COLORS.white}
                        ios_backgroundColor="#EEEEEE"
                        onValueChange={() => { }}
                        value={true}
                    />
                </View>

                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Biometric ID</Text>
                    <Switch
                        trackColor={{ false: '#EEEEEE', true: COLORS.primary }}
                        thumbColor={COLORS.white}
                        ios_backgroundColor="#EEEEEE"
                        onValueChange={setFingerprint}
                        value={fingerprint}
                    />
                </View>

                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Face ID</Text>
                    <Switch
                        trackColor={{ false: '#EEEEEE', true: COLORS.primary }}
                        thumbColor={COLORS.white}
                        ios_backgroundColor="#EEEEEE"
                        onValueChange={setFaceId}
                        value={faceId}
                    />
                </View>

                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>SMS Authenticator</Text>
                    <Switch
                        trackColor={{ false: '#EEEEEE', true: COLORS.primary }}
                        thumbColor={COLORS.white}
                        ios_backgroundColor="#EEEEEE"
                        onValueChange={setTwoFactor}
                        value={twoFactor}
                    />
                </View>

                <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Google Authenticator</Text>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
                </View>

                <TouchableOpacity style={styles.btnRow}>
                    <Text style={styles.btnLabel}>Change PIN</Text>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnRow}>
                    <Text style={styles.btnLabel}>Change Password</Text>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
                </TouchableOpacity>

            </ScrollView>

            <View style={styles.footer}>
                <Button title="Save Settings" onPress={() => navigation.goBack()} />
            </View>
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
    scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
    settingItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: SPACING.lg,
    },
    settingLabel: { ...TYPOGRAPHY.body, fontWeight: '600', color: COLORS.text },
    btnRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: SPACING.lg,
    },
    btnLabel: { ...TYPOGRAPHY.body, fontWeight: '600', color: COLORS.text },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl,
        backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
    },
});
