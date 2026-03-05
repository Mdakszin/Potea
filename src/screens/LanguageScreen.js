import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

export default function LanguageScreen({ navigation }) {
    const [selected, setSelected] = useState('en_us');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Language</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Suggest</Text>
                {LANGUAGES.slice(0, 2).map(lang => (
                    <TouchableOpacity
                        key={lang.id}
                        style={styles.langItem}
                        onPress={() => setSelected(lang.key)}
                    >
                        <Text style={styles.langLabel}>{lang.label}</Text>
                        <View style={styles.radioOut}>
                            {selected === lang.key && <View style={styles.radioIn} />}
                        </View>
                    </TouchableOpacity>
                ))}

                <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>Others</Text>
                {LANGUAGES.slice(2).map(lang => (
                    <TouchableOpacity
                        key={lang.id}
                        style={styles.langItem}
                        onPress={() => setSelected(lang.key)}
                    >
                        <Text style={styles.langLabel}>{lang.label}</Text>
                        <View style={styles.radioOut}>
                            {selected === lang.key && <View style={styles.radioIn} />}
                        </View>
                    </TouchableOpacity>
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
    sectionTitle: { ...TYPOGRAPHY.h3, fontSize: 18, marginBottom: SPACING.md },
    langItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: SPACING.lg,
    },
    langLabel: { ...TYPOGRAPHY.body, fontWeight: '600', color: COLORS.text },
    radioOut: {
        width: 22, height: 22, borderRadius: 11,
        borderWidth: 2, borderColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    radioIn: {
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: COLORS.primary,
    },
});
