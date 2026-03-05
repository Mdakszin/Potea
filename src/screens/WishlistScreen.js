import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PlantCard from '../components/PlantCard';
import { PLANTS } from '../constants/data';

export default function WishlistScreen({ navigation }) {
    const [wishlist, setWishlist] = useState(PLANTS.filter((_, i) => [0, 2, 4, 6].includes(i))); // Seeded wishlist

    const handleToggle = (id, val) => {
        if (!val) setWishlist(prev => prev.filter(p => p.id !== id));
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>My Wishlist</Text>
                </View>
                <TouchableOpacity style={styles.headerIcon}>
                    <Ionicons name="search" size={24} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={wishlist}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.gridContainer}
                renderItem={({ item }) => (
                    <PlantCard
                        item={{ ...item, isFavorite: true }}
                        onPress={(plant) => navigation.navigate('ProductDetail', { plant })}
                        onToggleFavorite={handleToggle}
                    />
                )}
                ListHeaderComponent={
                    wishlist.length > 0 ? (
                        <View style={styles.listHeader}>
                            <Text style={styles.countText}>{wishlist.length} Found</Text>
                        </View>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyIconCircle}>
                            <Ionicons name="heart-outline" size={60} color={COLORS.primary} />
                        </View>
                        <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
                        <Text style={styles.emptyText}>
                            You don't have any items in your wishlist at the moment.
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    backBtn: { marginRight: SPACING.md },
    title: { ...TYPOGRAPHY.h2 },
    headerIcon: { padding: 4 },
    listHeader: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
    countText: { ...TYPOGRAPHY.bodySmall, fontWeight: '700', color: COLORS.text },
    gridContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
    columnWrapper: { justifyContent: 'space-between', marginBottom: SPACING.md },
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100, paddingHorizontal: SPACING.xl },
    emptyIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
    emptyTitle: { ...TYPOGRAPHY.h3, marginBottom: SPACING.md },
    emptyText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, textAlign: 'center', lineHeight: 20 },
});
