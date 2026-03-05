import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const FAQS = [
    { id: '1', question: 'What is Potea?', answer: 'Potea is a premium plant shopping application where you can find the best indoor and outdoor plants for your home and office.' },
    { id: '2', question: 'How to use Potea?', answer: 'Simply browse our catalog, add plants to your cart, and checkout. You can also track your orders and manage your wallet for easier payments.' },
    { id: '3', question: 'Is Potea free to use?', answer: 'Yes, downloading and browsing Potea is free. You only pay for the plants you purchase.' },
    { id: '4', question: 'How to buy a plant?', answer: 'Click on a plant, select your preferred size and quantity, and click Buy Now.' },
    { id: '5', question: 'How do I track my order?', answer: 'Go to My Orders and select the active order to see its real-time tracking status.' },
];

const CONTACT_OPTIONS = [
    { id: '1', icon: 'headset-outline', label: 'Customer Service', target: 'CustomerServiceChat' },
    { id: '2', icon: 'globe-outline', label: 'Website', value: 'www.potea.com' },
    { id: '3', icon: 'logo-facebook', label: 'Facebook' },
    { id: '4', icon: 'logo-twitter', label: 'Twitter' },
    { id: '5', icon: 'logo-instagram', label: 'Instagram' },
];

export default function HelpCenterScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('faq');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);

    const filteredFaq = FAQS.filter(f => f.question.toLowerCase().includes(search.toLowerCase()));

    const renderFaqItem = ({ item }) => (
        <View style={styles.faqItem}>
            <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => setExpanded(expanded === item.id ? null : item.id)}
            >
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Ionicons name={expanded === item.id ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.primary} />
            </TouchableOpacity>
            {expanded === item.id && (
                <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                </View>
            )}
        </View>
    );

    const renderContactItem = ({ item }) => (
        <TouchableOpacity
            style={styles.contactItem}
            onPress={() => item.target && navigation.navigate(item.target)}
        >
            <View style={styles.contactLeft}>
                <Ionicons name={item.icon} size={24} color={COLORS.primary} />
                <Text style={styles.contactLabel}>{item.label}</Text>
            </View>
            {item.value && <Text style={styles.contactValue}>{item.value}</Text>}
            {!item.value && <Ionicons name="chevron-forward" size={20} color={COLORS.text} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Help Center</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.navTabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'faq' && styles.tabActive]}
                    onPress={() => setActiveTab('faq')}
                >
                    <Text style={[styles.tabText, activeTab === 'faq' && styles.tabTextActive]}>FAQ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'contact' && styles.tabActive]}
                    onPress={() => setActiveTab('contact')}
                >
                    <Text style={[styles.tabText, activeTab === 'contact' && styles.tabTextActive]}>Contact Us</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'faq' ? (
                <View style={{ flex: 1 }}>
                    <View style={styles.searchRow}>
                        <View style={styles.searchBar}>
                            <Ionicons name="search-outline" size={20} color={COLORS.textLight} style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search"
                                placeholderTextColor={COLORS.textLight}
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    </View>
                    <FlatList
                        data={filteredFaq}
                        keyExtractor={item => item.id}
                        renderItem={renderFaqItem}
                        contentContainerStyle={styles.listContent}
                    />
                </View>
            ) : (
                <FlatList
                    data={CONTACT_OPTIONS}
                    keyExtractor={item => item.id}
                    renderItem={renderContactItem}
                    contentContainerStyle={styles.listContent}
                />
            )}
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
    navTabs: {
        flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: COLORS.border,
        marginTop: SPACING.md,
    },
    tab: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, borderBottomWidth: 3, borderBottomColor: 'transparent' },
    tabActive: { borderBottomColor: COLORS.primary },
    tabText: { ...TYPOGRAPHY.body, color: COLORS.textLight, fontWeight: '700' },
    tabTextActive: { color: COLORS.primary },
    searchRow: { padding: SPACING.lg },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: SPACING.md,
        height: 48, borderWidth: 1, borderColor: COLORS.border,
    },
    searchIcon: { marginRight: SPACING.sm },
    searchInput: { flex: 1, ...TYPOGRAPHY.bodySmall, color: COLORS.text },
    listContent: { padding: SPACING.lg },
    faqItem: {
        backgroundColor: COLORS.white, borderRadius: 16, marginBottom: SPACING.md,
        borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
    },
    faqHeader: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: SPACING.lg,
    },
    faqQuestion: { ...TYPOGRAPHY.body, fontWeight: '700', color: COLORS.text, flex: 1 },
    faqBody: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
    faqAnswer: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, lineHeight: 20 },
    contactItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: COLORS.white, borderRadius: 16, padding: SPACING.lg,
        marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border,
    },
    contactLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    contactLabel: { ...TYPOGRAPHY.body, fontWeight: '700', color: COLORS.text },
    contactValue: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight },
});
