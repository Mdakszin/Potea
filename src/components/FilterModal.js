import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Modal, TouchableOpacity,
    ScrollView, Dimensions
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Button from './Button';

const { height } = Dimensions.get('window');

const FILTERS = {
    categories: ['All', 'Succulents', 'Cactus', 'Indoor', 'Outdoor', 'Palms'],
    sortBy: ['Popular', 'Most Recent', 'Price High', 'Price Low'],
    rating: [5, 4, 3, 2, 1],
};

export default function FilterModal({ visible, onClose, onApply }) {
    const [activeCategory, setActiveCategory] = useState('All');
    const [activeSort, setActiveSort] = useState('Popular');
    const [activeRating, setActiveRating] = useState(null);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Sort & Filter</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={COLORS.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Categories */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Categories</Text>
                            <View style={styles.chipRow}>
                                {FILTERS.categories.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.chip, activeCategory === cat && styles.chipActive]}
                                        onPress={() => setActiveCategory(cat)}
                                    >
                                        <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Price Range placeholder */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Price Range</Text>
                            <View style={styles.priceContainer}>
                                <View style={styles.sliderTrack}>
                                    <View style={styles.sliderActive} />
                                    <View style={[styles.sliderThumb, { left: '20%' }]} />
                                    <View style={[styles.sliderThumb, { left: '80%' }]} />
                                </View>
                                <View style={styles.priceLabels}>
                                    <Text style={styles.priceText}>$10</Text>
                                    <Text style={styles.priceText}>$100</Text>
                                </View>
                            </View>
                        </View>

                        {/* Sort By */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Sort by</Text>
                            <View style={styles.chipRow}>
                                {FILTERS.sortBy.map(sort => (
                                    <TouchableOpacity
                                        key={sort}
                                        style={[styles.chip, activeSort === sort && styles.chipActive]}
                                        onPress={() => setActiveSort(sort)}
                                    >
                                        <Text style={[styles.chipText, activeSort === sort && styles.chipTextActive]}>
                                            {sort}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Rating */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Rating</Text>
                            <View style={styles.chipRow}>
                                {FILTERS.rating.map(rate => (
                                    <TouchableOpacity
                                        key={rate}
                                        style={[styles.chip, activeRating === rate && styles.chipActive]}
                                        onPress={() => setActiveRating(rate)}
                                    >
                                        <Ionicons
                                            name="star"
                                            size={16}
                                            color={activeRating === rate ? COLORS.white : COLORS.primary}
                                            style={{ marginRight: 4 }}
                                        />
                                        <Text style={[styles.chipText, activeRating === rate && styles.chipTextActive]}>
                                            {rate}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Button
                            title="Reset"
                            variant="outline"
                            style={styles.footerBtn}
                            onPress={() => {
                                setActiveCategory('All');
                                setActiveSort('Popular');
                                setActiveRating(null);
                            }}
                        />
                        <Button
                            title="Apply"
                            style={styles.footerBtn}
                            onPress={() => onApply({ activeCategory, activeSort, activeRating })}
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingTop: SPACING.xl,
        maxHeight: height * 0.85,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
    },
    section: {
        paddingHorizontal: SPACING.xl,
        marginBottom: SPACING.xl,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h3,
        marginBottom: SPACING.md,
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    chipActive: {
        backgroundColor: COLORS.primary,
    },
    chipText: {
        ...TYPOGRAPHY.bodySmall,
        fontWeight: '600',
        color: COLORS.primary,
    },
    chipTextActive: {
        color: COLORS.white,
    },
    priceContainer: {
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    sliderTrack: {
        height: 4,
        backgroundColor: COLORS.border,
        borderRadius: 2,
        position: 'relative',
        justifyContent: 'center',
    },
    sliderActive: {
        position: 'absolute',
        left: '20%',
        right: '20%',
        height: 4,
        backgroundColor: COLORS.primary,
    },
    sliderThumb: {
        position: 'absolute',
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        borderWidth: 3,
        borderColor: COLORS.white,
        ...SHADOWS.small,
    },
    priceLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: SPACING.lg,
    },
    priceText: {
        ...TYPOGRAPHY.bodySmall,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        padding: SPACING.xl,
        gap: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    footerBtn: {
        flex: 1,
        borderRadius: 30,
    },
});
