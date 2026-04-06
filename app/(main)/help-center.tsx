import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

interface ContactOption {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    target?: string;
    value?: string;
}

const FAQS: FAQItem[] = [
    { id: '1', question: 'What is Potea?', answer: 'Potea is a premium plant shopping application...' },
    { id: '2', question: 'How to use Potea?', answer: 'Simply browse our catalog, add plants to your cart, and checkout.' },
    { id: '3', question: 'Is Potea free to use?', answer: 'Yes, downloading and browsing Potea is free.' },
    { id: '4', question: 'How to buy a plant?', answer: 'Click on a plant, select size and quantity, and click Buy Now.' },
    { id: '5', question: 'How do I track my order?', answer: 'Go to My Orders and select the active order to see its status.' },
];

const CONTACT_OPTIONS: ContactOption[] = [
    { id: '1', icon: 'headset-outline', label: 'Customer Service', target: '/(main)/customer-service' },
    { id: '2', icon: 'globe-outline', label: 'Website', value: 'www.potea.com' },
    { id: '3', icon: 'logo-facebook', label: 'Facebook' },
    { id: '4', icon: 'logo-twitter', label: 'Twitter' },
    { id: '5', icon: 'logo-instagram', label: 'Instagram' },
];

export default function HelpCenterScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState<string | null>(null);

    const filteredFaq = FAQS.filter(f => f.question.toLowerCase().includes(search.toLowerCase()));

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Help Center</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={[styles.navTabs, { borderBottomColor: colors.border }]}>
                {(['faq', 'contact'] as const).map(tab => (
                    <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
                        <Text style={[styles.tabText, { color: activeTab === tab ? COLORS.primary : colors.textLight }]}>{tab === 'faq' ? 'FAQ' : 'Contact Us'}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {activeTab === 'faq' ? (
                <View style={{ flex: 1 }}>
                    <View style={styles.searchRow}>
                        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Ionicons name="search-outline" size={20} color={colors.textLight} style={styles.searchIcon} />
                            <TextInput 
                                style={[styles.searchInput, { color: colors.text }]} 
                                placeholder="Search" 
                                placeholderTextColor={colors.textLight} 
                                value={search} 
                                onChangeText={setSearch} 
                            />
                        </View>
                    </View>
                    <FlatList
                        data={filteredFaq}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={[styles.faqItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                <TouchableOpacity style={styles.faqHeader} onPress={() => setExpanded(expanded === item.id ? null : item.id)}>
                                    <Text style={[styles.faqQuestion, { color: colors.text }]}>{item.question}</Text>
                                    <Ionicons name={expanded === item.id ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.primary} />
                                </TouchableOpacity>
                                {expanded === item.id && (
                                    <View style={styles.faqBody}>
                                        <Text style={[styles.faqAnswer, { color: colors.textLight }]}>{item.answer}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                </View>
            ) : (
                <FlatList
                    data={CONTACT_OPTIONS}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={[styles.contactItem, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => item.target && router.push(item.target as any)}>
                            <View style={styles.contactLeft}>
                                <Ionicons name={item.icon} size={24} color={COLORS.primary} />
                                <Text style={[styles.contactLabel, { color: colors.text }]}>{item.label}</Text>
                            </View>
                            {item.value ? (
                                <Text style={[styles.contactValue, { color: colors.textLight }]}>{item.value}</Text>
                            ) : (
                                <Ionicons name="chevron-forward" size={20} color={colors.text} />
                            )}
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    title: { fontSize: 24, fontWeight: '700' },
    navTabs: { flexDirection: 'row', borderBottomWidth: 1, marginTop: SPACING.md },
    tab: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: COLORS.primary },
    tabText: { fontSize: 16, fontWeight: '700' },
    searchRow: { padding: SPACING.lg },
    searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: SPACING.md, height: 48, borderWidth: 1 },
    searchIcon: { marginRight: SPACING.sm },
    searchInput: { flex: 1, fontSize: 14 },
    listContent: { padding: SPACING.lg },
    faqItem: { borderRadius: 16, marginBottom: SPACING.md, borderWidth: 1, overflow: 'hidden' },
    faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.lg },
    faqQuestion: { fontSize: 16, fontWeight: '700', flex: 1 },
    faqBody: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
    faqAnswer: { fontSize: 14, lineHeight: 20 },
    contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, padding: SPACING.lg, marginBottom: SPACING.md, borderWidth: 1 },
    contactLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    contactLabel: { fontSize: 16, fontWeight: '700' },
    contactValue: { fontSize: 14 },
});
