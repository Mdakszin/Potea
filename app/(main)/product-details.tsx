import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Image, ScrollView,
    TouchableOpacity, Alert
} from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import LayoutContainer from '../../src/components/LayoutContainer';
import { useResponsive } from '../../src/utils/responsive';
import { useTheme } from '../../src/contexts/ThemeContext';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import ReviewCard from '../../src/components/ReviewCard';
import { useAuth } from '../../src/contexts/AuthContext';
import { PLANTS } from '../../src/constants/data';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Review {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt?: Timestamp;
}

export default function ProductDetailScreen() {
    const { colors } = useTheme();
    const { currentUser, userData } = useAuth();
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const plantId = typeof id === 'string' ? id : '';
    const plant = PLANTS.find(p => p.id === plantId);
    
    if (!plant) return <View style={styles.centered}><Text>Plant not found</Text></View>;

    const [selectedSize, setSelectedSize] = useState(plant.sizes[0]);
    const [quantity, setQuantity] = useState(1);
    const [isFav, setIsFav] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        if (userData?.favorites) {
            setIsFav(userData.favorites.includes(plant.id));
        } else {
            setIsFav(plant.isFavorite || false);
        }
    }, [userData?.favorites, plant.id, plant.isFavorite]);

    useEffect(() => {
        const q = query(collection(db, 'reviews'), where('productId', '==', plant.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
            reviewsData.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
            setReviews(reviewsData);
        });
        return () => unsubscribe();
    }, [plant.id]);

    const toggleFavorite = async () => {
        if (!currentUser) {
            Alert.alert('Login Required', 'Please sign in to save favorites.');
            return;
        }
        const newFavState = !isFav;
        setIsFav(newFavState);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { 
                favorites: newFavState ? arrayUnion(plant.id) : arrayRemove(plant.id) 
            });
        } catch (error) {
            console.error('Error updating favorites:', error);
            setIsFav(!newFavState);
        }
    };

    const addToCart = async (navigate = false) => {
        if (!currentUser) {
            Alert.alert('Login Required', 'Please sign in to add items to your cart.');
            return;
        }
        try {
            const cartItemRef = doc(db, 'users', currentUser.uid, 'cart', plant.id);
            const cartDoc = await getDoc(cartItemRef);
            if (cartDoc.exists()) {
                const existingQty = cartDoc.data().qty || 1;
                await setDoc(cartItemRef, { 
                    ...cartDoc.data(), 
                    qty: existingQty + quantity 
                }, { merge: true });
            } else {
                await setDoc(cartItemRef, { 
                    id: plant.id, 
                    name: plant.name, 
                    price: plant.price, 
                    image: plant.image, 
                    qty: quantity, 
                    size: selectedSize, 
                    createdAt: new Date() 
                });
            }
            if (navigate) {
                router.push('/(main)/cart');
            } else {
                Alert.alert('Added!', `${plant.name} has been added to your cart.`);
            }
        } catch (error: any) {
            console.error('Error adding to cart:', error);
            Alert.alert('Error', `Could not add to cart. ${error.message || ''}`);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <LayoutContainer>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={toggleFavorite} style={styles.favBtn}>
                            <Ionicons name={isFav ? "heart" : "heart-outline"} size={24} color={isFav ? COLORS.primary : colors.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.imageContainer}>
                        <Image source={{ uri: plant.image }} style={styles.image} resizeMode="cover" />
                    </View>

                    <View style={[styles.detailsContainer, { backgroundColor: colors.background }]}>
                        <View style={styles.titleRow}>
                            <Text style={[styles.title, { color: colors.text }]}>{plant.name}</Text>
                            <Ionicons name="leaf-outline" size={24} color={COLORS.primary} />
                        </View>
                        <View style={styles.statsRow}>
                            <View style={[styles.soldBadge, { backgroundColor: COLORS.primaryLight }]}>
                                <Text style={styles.soldText}>7,148 sold</Text>
                            </View>
                            <Ionicons name="star" size={16} color="#FFD700" />
                            <Text style={[styles.ratingText, { color: colors.text }]}>{plant.rating} ({plant.reviews} reviews)</Text>
                        </View>
                        <View style={styles.divider} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
                        <Text style={[styles.description, { color: colors.textLight }]}>{plant.description || 'A beautiful plant for your home.'}</Text>
                        <View style={styles.sizeSection}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Size</Text>
                            <View style={styles.sizeOptions}>
                                {plant.sizes.map(size => (
                                    <TouchableOpacity 
                                        key={size} 
                                        style={[
                                            styles.sizeBtn, 
                                            { 
                                                borderColor: colors.primary, 
                                                backgroundColor: selectedSize === size ? colors.primary : 'transparent' 
                                            }
                                        ]} 
                                        onPress={() => setSelectedSize(size)}
                                    >
                                        <Text style={[ styles.sizeText, { color: selectedSize === size ? COLORS.white : colors.primary }]}>{size}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <View style={styles.qtySection}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quantity</Text>
                            <View style={[styles.qtyControl, { backgroundColor: colors.card }]}>
                                <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                                    <Ionicons name="remove" size={20} color={colors.text} />
                                </TouchableOpacity>
                                <Text style={[styles.qtyText, { color: colors.text }]}>{quantity}</Text>
                                <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                                    <Ionicons name="add" size={20} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {reviews.length > 0 && (
                            <View style={styles.reviewsSection}>
                                <View style={styles.reviewHeader}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews</Text>
                                    <TouchableOpacity onPress={() => router.push({ pathname: '/(main)/reviews', params: { productId: plant.id } })}>
                                        <Text style={{ color: COLORS.primary, fontWeight: '600' }}>View All</Text>
                                    </TouchableOpacity>
                                </View>
                                {reviews.slice(0, 2).map((review) => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </View>
                        )}
                    </View>
                </ScrollView>
                <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                    <View style={styles.priceContainer}>
                        <Text style={[styles.priceLabel, { color: colors.textLight }]}>Total Price</Text>
                        <Text style={[styles.priceValue, { color: COLORS.primary }]}>${(plant.price * quantity).toFixed(2)}</Text>
                    </View>
                    <Button title="Add to Cart" onPress={() => addToCart(false)} style={styles.addToCartBtn} />
                </View>
            </LayoutContainer>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: SPACING.lg, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
    favBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.8)', alignItems: 'center', justifyContent: 'center' },
    imageContainer: { width: '100%', height: 400 },
    image: { width: '100%', height: '100%' },
    detailsContainer: { padding: SPACING.lg, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    title: { fontSize: 24, fontWeight: '700' },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    soldBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6 },
    soldText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    ratingText: { fontSize: 14 },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    description: { fontSize: 14, lineHeight: 22, marginBottom: 16 },
    sizeSection: { marginBottom: 16 },
    sizeOptions: { flexDirection: 'row', gap: 12 },
    sizeBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
    sizeText: { fontSize: 14, fontWeight: '600' },
    qtySection: { marginBottom: SPACING.xl },
    qtyControl: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 15, alignSelf: 'flex-start', gap: 20 },
    qtyText: { fontSize: 18, fontWeight: '700' },
    footer: { flexDirection: 'row', padding: SPACING.lg, borderTopWidth: 1, alignItems: 'center' },
    priceContainer: { flex: 1 },
    priceLabel: { fontSize: 12 },
    priceValue: { fontSize: 24, fontWeight: '700' },
    addToCartBtn: { flex: 1.5 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    reviewsSection: { marginTop: 10 },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
});
