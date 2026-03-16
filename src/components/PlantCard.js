import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function PlantCard({ item, onPress, onToggleFavorite, style }) {
    const { colors } = useTheme();
    const { currentUser, userData } = useAuth();

    // Determine early if this is favored (fallback to item prop if auth isn't loaded)
    const isInitiallyFav = userData?.favorites ? userData.favorites.includes(item.id) : item.isFavorite || false;
    const [isFav, setIsFav] = useState(isInitiallyFav);
    const [addingToCart, setAddingToCart] = useState(false);

    // Sync state if userData changes remotely
    useEffect(() => {
        if (userData?.favorites) {
            setIsFav(userData.favorites.includes(item.id));
        }
    }, [userData?.favorites, item.id]);

    const handleFav = async () => {
        const newFavState = !isFav;
        setIsFav(newFavState);
        onToggleFavorite && onToggleFavorite(item.id, newFavState);

        if (currentUser) {
            try {
                const userRef = doc(db, 'users', currentUser.uid);
                await updateDoc(userRef, {
                    favorites: newFavState ? arrayUnion(item.id) : arrayRemove(item.id)
                });
            } catch (error) {
                console.error('Error updating favorites:', error);
                setIsFav(!newFavState); // Revert on failure
            }
        }
    };

    const addToCart = async () => {
        if (!currentUser) {
            Alert.alert('Login Required', 'Please sign in to add items to your cart.');
            return;
        }
        setAddingToCart(true);
        try {
            const cartItemRef = doc(db, 'users', currentUser.uid, 'cart', item.id);
            const cartDoc = await getDoc(cartItemRef);
            if (cartDoc.exists()) {
                const existingQty = cartDoc.data().qty || 1;
                await setDoc(cartItemRef, { ...cartDoc.data(), qty: existingQty + 1 }, { merge: true });
            } else {
                await setDoc(cartItemRef, {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,
                    qty: 1,
                    size: item.sizes ? item.sizes[0] : 'Medium',
                    createdAt: new Date(),
                });
            }
            Alert.alert('Added!', `${item.name} has been added to your cart.`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Error', 'Could not add to cart. Please try again.');
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <TouchableOpacity style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]} onPress={() => onPress && onPress(item)} activeOpacity={0.9}>
            {/* Image */}
            <View style={[styles.imageContainer, { backgroundColor: colors.surface }]}>
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
                <TouchableOpacity style={[styles.favButton, { backgroundColor: colors.card }]} onPress={handleFav}>
                    <Ionicons
                        name={isFav ? 'heart' : 'heart-outline'}
                        size={18}
                        color={isFav ? '#FF4C4C' : colors.textLight}
                    />
                </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>

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
                <TouchableOpacity style={[styles.addButton, addingToCart && { opacity: 0.6 }]} activeOpacity={0.8} onPress={addToCart} disabled={addingToCart}>
                    <Ionicons name={addingToCart ? "hourglass-outline" : "add"} size={18} color={COLORS.white} />
                    <Text style={styles.addButtonText}>{addingToCart ? 'Adding...' : 'Add to Cart'}</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        ...SHADOWS.small,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1,
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
        borderRadius: 20,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.small,
    },
    info: {
        padding: SPACING.sm,
    },
    name: {
        ...TYPOGRAPHY.bodySmall,
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
