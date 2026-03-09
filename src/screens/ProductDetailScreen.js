import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Image, ScrollView,
    TouchableOpacity
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import LayoutContainer from '../components/LayoutContainer';
import { useResponsive } from '../utils/responsive';
import { useTheme } from '../contexts/ThemeContext';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config/firebase';
import ReviewCard from '../components/ReviewCard';
import WriteReviewModal from '../components/WriteReviewModal';
import { useAuth } from '../contexts/AuthContext';

export default function ProductDetailScreen({ route, navigation }) {
    const { isMobile } = useResponsive();
    const { isDark, colors } = useTheme();
    const { currentUser, userData } = useAuth();
    const { plant } = route.params;
    const [selectedSize, setSelectedSize] = useState(plant.sizes[0]);
    const [quantity, setQuantity] = useState(1);

    // Initial favorite state from userData if available
    const isInitiallyFav = userData?.favorites ? userData.favorites.includes(plant.id) : plant.isFavorite || false;
    const [isFav, setIsFav] = useState(isInitiallyFav);

    // Sync isFav when userData.favorites updates
    useEffect(() => {
        if (userData?.favorites) {
            setIsFav(userData.favorites.includes(plant.id));
        }
    }, [userData?.favorites, plant.id]);

    const toggleFavorite = async () => {
        const newFavState = !isFav;
        setIsFav(newFavState);

        if (currentUser) {
            try {
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, {
                    favorites: newFavState ? arrayUnion(plant.id) : arrayRemove(plant.id)
                });
            } catch (error) {
                console.error('Error updating favorites:', error);
                setIsFav(!newFavState); // Revert on error
            }
        }
    };

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [isReviewModalVisible, setReviewModalVisible] = useState(false);

    useEffect(() => {
        const q = query(
            collection(db, 'reviews'),
            where('productId', '==', plant.id)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort by createdAt desc locally to avoid requiring composite index
            reviewsData.sort((a, b) => {
                const timeA = a.createdAt?.toMillis() || 0;
                const timeB = b.createdAt?.toMillis() || 0;
                return timeB - timeA;
            });
            setReviews(reviewsData);
        });

        return () => unsubscribe();
    }, [plant.id]);

    // Calculate dynamic rating based on real reviews
    const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : plant.rating;
    const totalReviews = reviews.length > 0 ? reviews.length : plant.reviews;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <LayoutContainer>
                {/* Header - Fixed at top */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.headerBtn, { borderColor: colors.border }]}>
                        <Ionicons name="arrow-back" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Detail Plant</Text>
                    <TouchableOpacity style={[styles.headerBtn, { borderColor: colors.border }]} onPress={toggleFavorite}>
                        <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? '#FF4C4C' : colors.text} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={isMobile ? styles.mobileLayout : styles.desktopLayout}>
                        {/* Image Section */}
                        <View style={isMobile ? styles.imageContainerMobile : styles.imageContainerDesktop}>
                            <Image source={{ uri: plant.image }} style={styles.image} resizeMode="cover" />
                        </View>

                        {/* Info Section */}
                        <View style={isMobile ? styles.infoSectionMobile : styles.infoSectionDesktop}>
                            <View style={styles.nameRow}>
                                <Text style={[styles.plantName, { color: colors.text }]}>{plant.name}</Text>
                                <Text style={styles.price}>${plant.price.toFixed(2)}</Text>
                            </View>

                            <View style={styles.ratingRow}>
                                <Ionicons name="star" size={16} color="#FFB800" />
                                <Text style={[styles.rating, { color: colors.text }]}>{avgRating}</Text>
                                <Text style={[styles.reviews, { color: colors.textLight }]}>({totalReviews.toLocaleString()} reviews)</Text>
                            </View>

                            {/* Size Selector */}
                            <Text style={[styles.label, { color: colors.text }]}>Size</Text>
                            <View style={styles.sizesRow}>
                                {plant.sizes.map(s => (
                                    <TouchableOpacity
                                        key={s}
                                        style={[styles.sizeChip, { borderColor: colors.border }, selectedSize === s && styles.sizeChipActive]}
                                        onPress={() => setSelectedSize(s)}
                                    >
                                        <Text style={[styles.sizeText, { color: colors.text }, selectedSize === s && styles.sizeTextActive]}>{s}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Description */}
                            <Text style={[styles.label, { color: colors.text }]}>About</Text>
                            <Text style={[styles.description, { color: colors.textLight }]}>{plant.description}</Text>

                            {/* Quantity */}
                            <View style={styles.quantityRow}>
                                <Text style={[styles.label, { color: colors.text }]}>Quantity</Text>
                                <View style={styles.qtyControl}>
                                    <TouchableOpacity
                                        style={[styles.qtyBtn, { borderColor: colors.border }]}
                                        onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                                    >
                                        <Ionicons name="remove" size={18} color={colors.text} />
                                    </TouchableOpacity>
                                    <Text style={[styles.qtyText, { color: colors.text }]}>{quantity}</Text>
                                    <TouchableOpacity style={[styles.qtyBtn, { borderColor: colors.border }]} onPress={() => setQuantity(quantity + 1)}>
                                        <Ionicons name="add" size={18} color={colors.text} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Reviews */}
                            <View style={styles.reviewsSection}>
                                <View style={styles.reviewsHeader}>
                                    <Text style={[styles.label, { color: colors.text }]}>Reviews</Text>
                                    <TouchableOpacity onPress={() => setReviewModalVisible(true)}>
                                        <Text style={styles.viewAll}>Write Review</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Rating Breakdown */}
                                <View style={styles.ratingBreakdown}>
                                    <View style={styles.ratingSummary}>
                                        <Text style={[styles.ratingLarge, { color: colors.text }]}>{avgRating}</Text>
                                        <View style={styles.starsRowMedium}>
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Ionicons key={i} name={i <= Math.round(avgRating) ? "star" : "star-outline"} size={16} color={i <= Math.round(avgRating) ? "#FFB800" : colors.border} />
                                            ))}
                                        </View>
                                        <Text style={[styles.reviewsCountSmall, { color: colors.textLight }]}>{totalReviews.toLocaleString()} reviews</Text>
                                    </View>
                                    <View style={styles.ratingBars}>
                                        {[5, 4, 3, 2, 1].map(star => {
                                            // Calculate actual distribution if possible, otherwise pseudo-random for now
                                            const starCount = reviews.filter(r => r.rating === star).length;
                                            const percentage = reviews.length > 0 ? (starCount / reviews.length) * 100 : (Math.random() * 80 + 20);

                                            return (
                                                <View key={star} style={styles.barRow}>
                                                    <Text style={[styles.starNum, { color: colors.text }]}>{star}</Text>
                                                    <View style={[styles.barEmpty, { backgroundColor: colors.border }]}>
                                                        <View style={[styles.barFill, { width: `${percentage}%` }]} />
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>

                                {reviews.length > 0 ? (
                                    reviews.map(review => (
                                        <ReviewCard key={review.id} review={review} />
                                    ))
                                ) : (
                                    <View style={{ paddingVertical: SPACING.xl, alignItems: 'center' }}>
                                        <Text style={{ color: colors.textLight, ...TYPOGRAPHY.bodySmall }}>No reviews yet. Be the first!</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </LayoutContainer>

            {/* Footer Buttons */}
            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <TouchableOpacity style={[styles.wishBtn, { borderColor: colors.primary }]} onPress={() => navigation.navigate('Cart')}>
                    <Ionicons name="cart-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
                <Button title="Buy Now" style={styles.buyBtn} onPress={() => navigation.navigate('Cart')} />
            </View>

            <WriteReviewModal
                visible={isReviewModalVisible}
                onClose={() => setReviewModalVisible(false)}
                productId={plant.id}
            />
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
    headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, flex: 1, textAlign: 'center' },

    mobileLayout: { flex: 1 },
    desktopLayout: { flexDirection: 'row', gap: SPACING.xl, padding: SPACING.xl },

    imageContainerMobile: { width: '100%', height: 400 },
    imageContainerDesktop: { flex: 1, height: 600, borderRadius: 24, overflow: 'hidden' },

    image: { width: '100%', height: '100%' },

    infoSectionMobile: { padding: SPACING.xl },
    infoSectionDesktop: { flex: 1.2, paddingVertical: 0 },
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
