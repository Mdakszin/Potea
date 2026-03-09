import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput,
    TouchableOpacity, Modal, ScrollView
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PlantCard from '../components/PlantCard';
import Button from '../components/Button';
import FilterModal from '../components/FilterModal';
import { PLANTS, CATEGORIES } from '../constants/data';
import LayoutContainer from '../components/LayoutContainer';
import { useResponsive } from '../utils/responsive';
import { useTheme } from '../contexts/ThemeContext';

export default function ExploreScreen({ navigation, route }) {
    const { getColumns } = useResponsive();
    const { isDark, colors } = useTheme();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [showFilter, setShowFilter] = useState(false);
    const [history, setHistory] = useState(['Monstera', 'Indoor Plants', 'Snake Plant']);
    const [isFocused, setIsFocused] = useState(false);

    const [activeSort, setActiveSort] = useState('Popular');
    const [activeRating, setActiveRating] = useState(null);

    const numColumns = getColumns();

    useEffect(() => {
        if (route.params?.searchQuery) {
            setSearch(route.params.searchQuery);
            setIsFocused(false);
        }
        if (route.params?.openFilter) {
            setShowFilter(true);
        }
    }, [route.params]);

    let filtered = PLANTS.filter(p => {
        const matchCat = activeCategory === 'all' || p.category.toLowerCase() === activeCategory.toLowerCase();
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchRating = activeRating ? p.rating >= activeRating : true;
        return matchCat && matchSearch && matchRating;
    });

    if (activeSort === 'Price High') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (activeSort === 'Price Low') {
        filtered.sort((a, b) => a.price - b.price);
    }

    const handleSearch = (text) => {
        setSearch(text);
        if (text && !history.includes(text)) {
            // In real app, push to history on "Enter"
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <LayoutContainer>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
                    <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)}>
                        <Ionicons name="options-outline" size={22} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchBar}>
                    <Ionicons name="search-outline" size={20} color={colors.textLight} style={styles.searchIcon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Find your favorite plants..."
                        placeholderTextColor={colors.textLight}
                        value={search}
                        onChangeText={handleSearch}
                        onFocus={() => setIsFocused(true)}
                    // onBlur={() => setIsFocused(false)} // Keep focused to show history
                    />
                </View>

                {/* Content Switcher */}
                {isFocused && search === '' ? (
                    /* Search History */
                    <View style={styles.historyContainer}>
                        <View style={styles.historyHeader}>
                            <Text style={styles.historyTitle}>Recent</Text>
                            <TouchableOpacity onPress={() => setHistory([])}>
                                <Text style={styles.clearAll}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.historyList}>
                            {history.map((item, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={styles.historyItem}
                                    onPress={() => setSearch(item)}
                                >
                                    <Text style={styles.historyText}>{item}</Text>
                                    <Ionicons name="close" size={18} color={COLORS.textLight} />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => setIsFocused(false)}>
                            <Text style={[styles.clearAll, { textAlign: 'center' }]}>Close History</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Categories or Search Result Header */}
                        {search !== '' ? (
                            <View style={styles.resultsHeader}>
                                <Text style={styles.resultsTitle}>Results for "{search}"</Text>
                                <Text style={styles.resultsCount}>{filtered.length} found</Text>
                            </View>
                        ) : (
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={CATEGORIES}
                                keyExtractor={c => c.id}
                                contentContainerStyle={styles.categoriesContainer}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[styles.catChip, activeCategory === item.id && styles.catChipActive]}
                                        onPress={() => setActiveCategory(item.id)}
                                    >
                                        <Text style={[styles.catText, activeCategory === item.id && styles.catTextActive]}>
                                            {item.label}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                style={styles.categoriesScroll}
                            />
                        )}

                        {/* Grid */}
                        <View style={[styles.sectionHeader, { paddingHorizontal: SPACING.lg, marginTop: SPACING.md, marginBottom: SPACING.md }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>All Plants</Text>
                        </View>
                        <FlatList
                            key={`grid-${numColumns}`}
                            data={filtered}
                            keyExtractor={item => item.id}
                            numColumns={numColumns}
                            columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
                            contentContainerStyle={styles.gridContainer}
                            renderItem={({ item }) => (
                                <PlantCard
                                    item={item}
                                    style={numColumns > 1 ? { marginHorizontal: SPACING.xs } : { marginBottom: SPACING.md }}
                                    onPress={(plant) => navigation.navigate('ProductDetail', { plant })}
                                />
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <View style={styles.emptyIconCircle}>
                                        <Ionicons name="search" size={60} color={COLORS.primary} />
                                    </View>
                                    <Text style={styles.emptyTitle}>Not Found</Text>
                                    <Text style={styles.emptyText}>
                                        Sorry, the keyword you entered cannot be found, please check again or search with another keyword.
                                    </Text>
                                </View>
                            }
                        />
                    </>
                )}

                <FilterModal
                    visible={showFilter}
                    onClose={() => setShowFilter(false)}
                    onApply={(filters) => {
                        setActiveCategory(filters.activeCategory === 'All' ? 'all' : filters.activeCategory.toLowerCase());
                        setActiveSort(filters.activeSort);
                        setActiveRating(filters.activeRating);
                        setShowFilter(false);
                    }}
                />
            </LayoutContainer>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.md,
    },
    title: { ...TYPOGRAPHY.h2 },
    filterBtn: {
        width: 42, height: 42, borderRadius: 12,
        borderWidth: 1, borderColor: COLORS.border,
        alignItems: 'center', justifyContent: 'center',
    },
    searchBar: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: SPACING.md,
        height: 48, borderWidth: 1, borderColor: COLORS.border,
        marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    },
    searchIcon: { marginRight: SPACING.sm },
    searchInput: { flex: 1, ...TYPOGRAPHY.bodySmall, color: COLORS.text },
    categoriesScroll: { marginBottom: SPACING.md },
    categoriesContainer: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
    catChip: {
        paddingVertical: 8, paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.card, borderRadius: 20,
        borderWidth: 1, borderColor: COLORS.border,
    },
    catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    catText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, fontWeight: '600' },
    catTextActive: { color: COLORS.white },

    historyContainer: { paddingHorizontal: SPACING.lg, flex: 1 },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    historyTitle: { ...TYPOGRAPHY.h3 },
    clearAll: { ...TYPOGRAPHY.bodySmall, fontWeight: '600' },
    historyList: { gap: SPACING.md },
    historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, paddingBottom: SPACING.sm },
    historyText: { ...TYPOGRAPHY.body },

    resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
    resultsTitle: { ...TYPOGRAPHY.h3 },
    resultsCount: { ...TYPOGRAPHY.bodySmall, fontWeight: '600' },

    gridContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
    columnWrapper: { gap: SPACING.md, marginBottom: SPACING.md },

    emptyContainer: { alignItems: 'center', paddingVertical: SPACING.xxl, paddingHorizontal: SPACING.xl },
    emptyIconCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
    emptyTitle: { ...TYPOGRAPHY.h3, marginBottom: SPACING.md },
    emptyText: { ...TYPOGRAPHY.bodySmall, textAlign: 'center', lineHeight: 20 },
});
