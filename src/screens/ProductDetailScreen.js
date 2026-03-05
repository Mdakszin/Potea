import React, { useState } from 'react';
import {
    View, Text, StyleSheet, Image, ScrollView,
    TouchableOpacity, Dimensions
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ route, navigation }) {
    const { plant } = route.params;
    const [selectedSize, setSelectedSize] = useState(plant.sizes[0]);
    const [quantity, setQuantity] = useState(1);
    const [isFav, setIsFav] = useState(plant.isFavorite);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Detail Plant</Text>
                    <TouchableOpacity style={styles.headerBtn} onPress={() => setIsFav(!isFav)}>
                        <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? '#FF4C4C' : COLORS.text} />
                    </TouchableOpacity>
                </View>

                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: plant.image }} style={styles.image} resizeMode="cover" />
                </View>

                {/* Info */}
                <View style={styles.infoSection}>
                    <View style={styles.nameRow}>
                        <Text style={styles.plantName}>{plant.name}</Text>
                        <Text style={styles.price}>${plant.price.toFixed(2)}</Text>
                    </View>

                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={16} color="#FFB800" />
                        <Text style={styles.rating}>{plant.rating}</Text>
                        <Text style={styles.reviews}>({plant.reviews.toLocaleString()} reviews)</Text>
                    </View>

                    {/* Size Selector */}
                    <Text style={styles.label}>Size</Text>
                    <View style={styles.sizesRow}>
                        {plant.sizes.map(s => (
                            <TouchableOpacity
                                key={s}
                                style={[styles.sizeChip, selectedSize === s && styles.sizeChipActive]}
                                onPress={() => setSelectedSize(s)}
                            >
                                <Text style={[styles.sizeText, selectedSize === s && styles.sizeTextActive]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Description */}
                    <Text style={styles.label}>About</Text>
                    <Text style={styles.description}>{plant.description}</Text>

                    {/* Quantity */}
                    <View style={styles.quantityRow}>
                        <Text style={styles.label}>Quantity</Text>
                        <View style={styles.qtyControl}>
                            <TouchableOpacity
                                style={styles.qtyBtn}
                                onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                            >
                                <Ionicons name="remove" size={18} color={COLORS.text} />
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{quantity}</Text>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
                                <Ionicons name="add" size={18} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Reviews */}
                    <View style={styles.reviewsSection}>
                        <View style={styles.reviewsHeader}>
                            <Text style={styles.label}>Reviews</Text>
                            <TouchableOpacity>
                                <Text style={styles.viewAll}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Rating Breakdown */}
                        <View style={styles.ratingBreakdown}>
                            <View style={styles.ratingSummary}>
                                <Text style={styles.ratingLarge}>{plant.rating}</Text>
                                <View style={styles.starsRowMedium}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Ionicons key={i} name="star" size={16} color="#FFB800" />
                                    ))}
                                </View>
                                <Text style={styles.reviewsCountSmall}>{plant.reviews.toLocaleString()} reviews</Text>
                            </View>
                            <View style={styles.ratingBars}>
                                {[5, 4, 3, 2, 1].map(star => (
                                    <View key={star} style={styles.barRow}>
                                        <Text style={styles.starNum}>{star}</Text>
                                        <View style={styles.barEmpty}>
                                            <View style={[styles.barFill, { width: `${Math.random() * 80 + 20}%` }]} />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.reviewCard}>
                            <View style={styles.reviewerHeader}>
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80' }}
                                    style={styles.reviewerAvatar}
                                />
                                <View style={styles.reviewerInfo}>
                                    <Text style={styles.reviewerName}>Charley Robertson</Text>
                                    <View style={styles.starsRow}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Ionicons key={i} name="star" size={12} color="#FFB800" />
                                        ))}
                                    </View>
                                </View>
                                <Text style={styles.reviewTime}>2 days ago</Text>
                            </View>
                            <Text style={styles.reviewText}>
                                The plant is very healthy and beautiful. The packaging was very safe and the delivery was fast. Highly recommended!
                            </Text>
                        </View>

                        <View style={styles.reviewCard}>
                            <View style={styles.reviewerHeader}>
                                <Image
                                    source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' }}
                                    style={styles.reviewerAvatar}
                                />
                                <View style={styles.reviewerInfo}>
                                    <Text style={styles.reviewerName}>Benny Spanbauer</Text>
                                    <View style={styles.starsRow}>
                                        {[1, 2, 3, 4].map(i => (
                                            <Ionicons key={i} name="star" size={12} color="#FFB800" />
                                        ))}
                                        <Ionicons name="star-outline" size={12} color="#FFB800" />
                                    </View>
                                </View>
                                <Text style={styles.reviewTime}>a week ago</Text>
                            </View>
                            <Text style={styles.reviewText}>
                                Good plant, slightly smaller than expected but still very nice.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Buttons */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.wishBtn} onPress={() => navigation.navigate('Cart')}>
                    <Ionicons name="cart-outline" size={22} color={COLORS.primary} />
                </TouchableOpacity>
                <Button title="Buy Now" style={styles.buyBtn} onPress={() => navigation.navigate('Cart')} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
    },
    headerBtn: {
        width: 40, height: 40, borderRadius: 12,
        borderWidth: 1, borderColor: COLORS.border,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { ...TYPOGRAPHY.h3 },
    imageContainer: {
        width: width, height: width * 0.8, backgroundColor: COLORS.primaryLight,
    },
    image: { width: '100%', height: '100%' },
    infoSection: { padding: SPACING.lg },
    nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    plantName: { ...TYPOGRAPHY.h2, flex: 1, marginRight: SPACING.sm },
    price: { ...TYPOGRAPHY.h2, color: COLORS.primary },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SPACING.lg },
    rating: { ...TYPOGRAPHY.body, fontWeight: '700' },
    reviews: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight },
    label: { ...TYPOGRAPHY.h3, fontSize: 16, marginBottom: SPACING.sm, marginTop: SPACING.sm },
    sizesRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
    sizeChip: {
        width: 44, height: 44, borderRadius: 12,
        borderWidth: 1.5, borderColor: COLORS.border,
        alignItems: 'center', justifyContent: 'center',
    },
    sizeChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
    sizeText: { ...TYPOGRAPHY.bodySmall, fontWeight: '600', color: COLORS.text },
    sizeTextActive: { color: COLORS.primary },
    description: { ...TYPOGRAPHY.body, color: COLORS.textLight, lineHeight: 24, marginBottom: SPACING.lg },
    quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    qtyControl: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    qtyBtn: {
        width: 36, height: 36, borderRadius: 10,
        borderWidth: 1, borderColor: COLORS.border,
        alignItems: 'center', justifyContent: 'center',
    },
    qtyText: { ...TYPOGRAPHY.h3, minWidth: 24, textAlign: 'center' },

    reviewsSection: { marginTop: SPACING.xl },
    reviewsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    viewAll: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: '700' },
    reviewCard: { marginTop: SPACING.lg },

    ratingBreakdown: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.md, gap: SPACING.xl },
    ratingSummary: { alignItems: 'center' },
    ratingLarge: { fontSize: 48, fontWeight: '700', color: COLORS.text },
    starsRowMedium: { flexDirection: 'row', gap: 2, marginVertical: 4 },
    reviewsCountSmall: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, fontSize: 10 },
    ratingBars: { flex: 1 },
    barRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
    starNum: { ...TYPOGRAPHY.bodySmall, width: 10, fontWeight: '700' },
    barEmpty: { flex: 1, height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden' },
    barFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },

    reviewerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    reviewerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: SPACING.md },
    reviewerInfo: { flex: 1 },
    reviewerName: { ...TYPOGRAPHY.body, fontWeight: '700' },
    starsRow: { flexDirection: 'row', gap: 2, marginTop: 2 },
    reviewTime: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, fontSize: 11 },
    reviewText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, lineHeight: 18 },

    footer: {
        flexDirection: 'row', paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.xl, paddingTop: SPACING.md,
        gap: SPACING.md,
        borderTopWidth: 1, borderTopColor: COLORS.border,
        backgroundColor: COLORS.white,
    },
    wishBtn: {
        width: 56, height: 56, borderRadius: 16,
        borderWidth: 1.5, borderColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
    },
    buyBtn: { flex: 1 },
});
