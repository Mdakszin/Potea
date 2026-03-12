import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PlantCard from '../../src/components/PlantCard';
import { PLANTS } from '../../src/constants/data';
import LayoutContainer from '../../src/components/LayoutContainer';
import { useResponsive } from '../../src/utils/responsive';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function SearchScreen() {
    const { getColumns } = useResponsive();
    const { colors } = useTheme();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const numColumns = getColumns();

    const filteredPlants = PLANTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <LayoutContainer>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                    <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
                        <Ionicons name="search-outline" size={20} color={colors.textLight} />
                        <TextInput style={[styles.input, { color: colors.text }]} placeholder="Search" placeholderTextColor={colors.textLight} value={searchQuery} onChangeText={setSearchQuery} autoFocus />
                    </View>
                </View>

                <FlatList
                    key={`grid-${numColumns}`}
                    data={filteredPlants}
                    keyExtractor={item => item.id}
                    numColumns={numColumns}
                    columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
                    contentContainerStyle={styles.gridContainer}
                    renderItem={({ item }) => (
                        <PlantCard item={item} style={numColumns > 1 ? { marginHorizontal: SPACING.xs } : { marginBottom: SPACING.md }} onPress={() => router.push({ pathname: '/(main)/product-details', params: { id: item.id } })} />
                    )}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={80} color={colors.border} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
                            <Text style={[styles.emptyText, { color: colors.textLight }]}>Try a different keyword or check your spelling.</Text>
                        </View>
                    }
                />
            </LayoutContainer>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: 12 },
    searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 48, borderRadius: 12, gap: 10 },
    input: { flex: 1, fontSize: 16 },
    gridContainer: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
    columnWrapper: { gap: SPACING.md, marginBottom: SPACING.md },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
    emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 24, marginBottom: 12 },
    emptyText: { fontSize: 16, textAlign: 'center', paddingHorizontal: 40 },
});
