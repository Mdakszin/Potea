import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

const LANGUAGES = [
    { id: '1', label: 'English (US)', key: 'en_us' },
    { id: '2', label: 'English (UK)', key: 'en_uk' },
    { id: '3', label: 'Mandarin', key: 'zh' },
    { id: '4', label: 'Spanish', key: 'es' },
    { id: '5', label: 'French', key: 'fr' },
    { id: '6', label: 'German', key: 'de' },
    { id: '7', label: 'Italian', key: 'it' },
    { id: '8', label: 'Portuguese', key: 'pt' },
    { id: '9', label: 'Arabic', key: 'ar' },
    { id: '10', label: 'Japanese', key: 'ja' },
    { id: '11', label: 'Korean', key: 'ko' },
];

export default function LanguageScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [selected, setSelected] = useState('en_us');

    const renderLangItem = (lang) => (
        <TouchableOpacity key={lang.id} style={styles.langItem} onPress={() => setSelected(lang.key)}>
            <Text style={[styles.langLabel, { color: colors.text }]}>{lang.label}</Text>
            <View style={[styles.radioOut, { borderColor: COLORS.primary }]}>
                {selected === lang.key && <View style={styles.radioIn} />}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Language</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Suggest</Text>
                {LANGUAGES.slice(0, 2).map(renderLangItem)}
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: SPACING.lg }]}>Others</Text>
                {LANGUAGES.slice(2).map(renderLangItem)}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    title: { fontSize: 24, fontWeight: '700' },
    scrollContent: { padding: SPACING.lg },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: SPACING.md },
    langItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.lg },
    langLabel: { fontSize: 16, fontWeight: '600' },
    radioOut: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    radioIn: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.primary },
});
