import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SPACING.lg * 2 - SPACING.md) / 2;

export default function PlantCard({ item, onPress, onToggleFavorite, style }) {
    const [isFav, setIsFav] = useState(item.isFavorite);

    const handleFav = () => {
        setIsFav(!isFav);
        onToggleFavorite && onToggleFavorite(item.id, !isFav);
    };

    return (
        <TouchableOpacity style={[styles.card, style]} onPress={() => onPress && onPress(item)} activeOpacity={0.9}>
            {/* Image */}
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                <TouchableOpacity style={styles.favButton} onPress={handleFav}>
                    <Ionicons
                        name={isFav ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isFav ? '#FF4C4C' : COLORS.textLight}
                    />
                </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>

                {/* Price Row */}
                <View style={styles.priceRow}>
                    <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                    <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
                </View>

                {/* Rating */}
                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={12} color="#FFB800" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>

                {/* Add to Cart */}
                <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
                    <Ionicons name="add" size={18} color={COLORS.white} />
                    <Text style={styles.addButtonText}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: CARD_WIDTH,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    imageContainer: {
        width: '100%',
        height: CARD_WIDTH * 0.9,
        backgroundColor: COLORS.primaryLight,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: COLORS.white,
        borderRadius: 20,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    info: {
        padding: SPACING.sm,
    },
    name: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.text,
        fontWeight: '600',
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary,
    },
    originalPrice: {
        fontSize: 12,
        color: COLORS.textLight,
        textDecorationLine: 'line-through',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginBottom: SPACING.sm,
    },
    ratingText: {
        fontSize: 11,
        color: COLORS.textLight,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        gap: 4,
    },
    addButtonText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLORS.white,
    },
});
