import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function AboutPoteaScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>About Potea</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.logoContainer}><Ionicons name="leaf" size={100} color={COLORS.primary} /><Text style={[styles.appName, { color: colors.text }]}>Potea</Text><Text style={[styles.version, { color: colors.textLight }]}>Version 2.0.0</Text></View>
                <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.text }]}>Our Story</Text><Text style={[styles.sectionText, { color: colors.text }]}>Potea was born out of a love for nature and a desire to make the world a greener place. We believe that everyone should have access to beautiful, healthy plants and the knowledge to care for them.</Text></View>
                <View style={styles.section}><Text style={[styles.sectionTitle, { color: colors.text }]}>Our Mission</Text><Text style={[styles.sectionText, { color: colors.text }]}>To provide the highest quality plants and garden accessories, delivered with care to your doorstep. We strive to inspire and educate our community to grow their own green spaces, no matter how small.</Text></View>
                <View style={[styles.footer, { borderTopColor: colors.border }]}><Text style={[styles.footerText, { color: colors.textLight }]}>© 2026 Potea Inc. All rights reserved.</Text></View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: SPACING.lg },
    headerTitle: { fontSize: 24, fontWeight: '700' },
    content: { padding: SPACING.xl },
    logoContainer: { alignItems: 'center', marginBottom: 40 },
    appName: { fontSize: 32, fontWeight: '800', marginTop: 16 },
    version: { fontSize: 16, marginTop: 4 },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
    sectionText: { fontSize: 16, lineHeight: 24 },
    footer: { marginTop: 40, paddingTop: 24, borderTopWidth: 1, alignItems: 'center' },
    footerText: { fontSize: 14 },
});
