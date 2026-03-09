import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PlantCard from '../components/PlantCard';
import { PLANTS as PROJECTS_PLANTS } from '../constants/data';
import LayoutContainer from '../components/LayoutContainer';
import { useResponsive } from '../utils/responsive';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function WishlistScreen({ navigation }) {
    const { getColumns } = useResponsive();
    const { colors, isDark } = useTheme();
    const { userData } = useAuth();
    const numColumns = getColumns();

    // Filter plants that are in the user's favorites array
    const favoritesIds = userData?.favorites || [];
    const wishlist = PROJECTS_PLANTS.filter(p => favoritesIds.includes(p.id));

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <LayoutContainer>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: colors.text }]}>My Wishlist</Text>
                    </View>
                    <TouchableOpacity style={styles.headerIcon}>
                        <Ionicons name="search" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <FlatList
                    key={`grid-${numColumns}`}
                    data={wishlist}
                    keyExtractor={item => item.id}
                    numColumns={numColumns}
                    columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
                    contentContainerStyle={styles.gridContainer}
                    renderItem={({ item }) => (
                        <PlantCard
                            item={item}
                            style={numColumns > 1 ? { marginHorizontal: SPACING.xs } : { marginBottom: SPACING.md }}
                            onPress={(p) => navigation.navigate('ProductDetail', { plant: p })}
                        />
                    )}
                    ListHeaderComponent={
                        wishlist.length > 0 ? (
                            <View style={styles.listHeader}>
                                <Text style={[styles.countText, { color: colors.text }]}>{wishlist.length} Found</Text>
                            </View>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? 'rgba(76, 175, 80, 0.1)' : COLORS.primaryLight }]}>
                                <Ionicons name="heart-outline" size={60} color={COLORS.primary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>Your Wishlist is Empty</Text>
                            <Text style={[styles.emptyText, { color: colors.textLight }]}>
                                You don't have any items in your wishlist at the moment.
                            </Text>
                        </View>
                    }
                />
            </LayoutContainer>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    backBtn: { marginRight: SPACING.md },
    title: { ...TYPOGRAPHY.h2 },
    headerIcon: { padding: 4 },
    listHeader: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
    countText: { ...TYPOGRAPHY.bodySmall, fontWeight: '700' },
    gridContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
    columnWrapper: { gap: SPACING.md, marginBottom: SPACING.md },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100, paddingHorizontal: SPACING.xl },
    emptyIconCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
    emptyTitle: { ...TYPOGRAPHY.h3, marginBottom: SPACING.md },
    emptyText: { ...TYPOGRAPHY.bodySmall, textAlign: 'center', lineHeight: 20 },
});
