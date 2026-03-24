import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput,
    TouchableOpacity
} from 'react-native';
import { COLORS, SPACING } from '../../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PlantCard from '../../../src/components/PlantCard';
import FilterModal from '../../../src/components/FilterModal';
import { PLANTS } from '../../../src/constants/data';
import LayoutContainer from '../../../src/components/LayoutContainer';
import { useResponsive } from '../../../src/utils/responsive';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ExploreScreen() {
    const { getColumns } = useResponsive();
    const { colors } = useTheme();
    const { searchQuery, openFilter } = useLocalSearchParams();
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [showFilter, setShowFilter] = useState(false);
    const [history, setHistory] = useState(['Monstera', 'Indoor Plants', 'Snake Plant']);
    const [isFocused, setIsFocused] = useState(false);
    const [activeSort, setActiveSort] = useState('Popular');
    const [activeRating, setActiveRating] = useState<number | null>(null);
    const router = useRouter();

    const numColumns = getColumns();

    useEffect(() => {
        if (searchQuery && typeof searchQuery === 'string') {
            setSearch(searchQuery);
            setIsFocused(false);
        }
        if (openFilter === 'true') {
            setShowFilter(true);
        }
    }, [searchQuery, openFilter]);

    let filtered = [...PLANTS].filter(p => {
        const matchCat = activeCategory === 'all' || p.category.toLowerCase() === activeCategory.toLowerCase();
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchRating = activeRating ? (p.rating || 0) >= activeRating : true;
        return matchCat && matchSearch && matchRating;
    });

    if (activeSort === 'Price High') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (activeSort === 'Price Low') {
        filtered.sort((a, b) => a.price - b.price);
    }

    const handleSearch = (text: string) => {
        setSearch(text);
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
                    />
                </View>

                {isFocused && search === '' ? (
                    <View style={styles.historyContainer}>
                        <View style={styles.historyHeader}>
                            <Text style={[styles.historyTitle, { color: colors.text }]}>Recent</Text>
                            <TouchableOpacity onPress={() => setHistory([])}>
                                <Text style={styles.clearAll}>Clear All</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.historyList}>
                            {history.map((item, idx) => (
                                <TouchableOpacity key={idx} style={styles.historyItem} onPress={() => setSearch(item)}>
                                    <Text style={[styles.historyText, { color: colors.textLight }]}>{item}</Text>
                                    <Ionicons name="close-outline" size={20} color={colors.textLight} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ) : (
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
                                onPress={() => router.push({ pathname: '/(main)/product-details', params: { id: item.id } })}
                            />
                        )}
                    />
                )}
            </LayoutContainer>
            <FilterModal
                visible={showFilter}
                onClose={() => setShowFilter(false)}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                activeSort={activeSort}
                setActiveSort={setActiveSort}
                activeRating={activeRating}
                setActiveRating={setActiveRating}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    title: { fontSize: 24, fontWeight: '700' },
    filterBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 12, paddingHorizontal: SPACING.md, height: 48, marginHorizontal: SPACING.lg, marginBottom: SPACING.lg },
    searchIcon: { marginRight: SPACING.sm },
    searchInput: { flex: 1, fontSize: 14 },
    historyContainer: { paddingHorizontal: SPACING.lg },
    historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
    historyTitle: { fontSize: 18, fontWeight: '700' },
    clearAll: { color: COLORS.primary, fontWeight: '600' },
    historyList: { gap: SPACING.sm },
    historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm },
    historyText: { fontSize: 16 },
    gridContainer: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
    columnWrapper: { gap: SPACING.md, marginBottom: SPACING.md },
});
