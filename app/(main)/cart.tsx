import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    Image, TouchableOpacity, Alert, ActivityIndicator, Platform
} from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import { db } from '../../src/config/firebase';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../src/contexts/AuthContext';
import LayoutContainer from '../../src/components/LayoutContainer';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    qty: number;
    size: string;
    createdAt?: Timestamp;
}

const EmptyCart = () => {
    const router = useRouter();
    const { colors } = useTheme();
    return (
        <View style={emptyStyles.container}>
            <View style={emptyStyles.iconBg}>
                <Ionicons name="cart-outline" size={80} color={COLORS.primary} />
            </View>
            <Text style={[emptyStyles.title, { color: colors.text }]}>Your Cart is Empty!</Text>
            <Text style={[emptyStyles.subtitle, { color: colors.textLight }]}>Looks like you haven't added any plants yet. Start shopping now!</Text>
            <Button title="Explore Plants" onPress={() => router.push('/(main)/(tabs)/explore')} style={{ marginTop: SPACING.xl, width: '80%' }} />
        </View>
    );
};

const emptyStyles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
    iconBg: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl },
    title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: SPACING.sm },
    subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
});

export default function CartScreen() {
    const { currentUser } = useAuth();
    const { colors } = useTheme();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!currentUser) return;
        const q = collection(db, 'users', currentUser.uid, 'cart');
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
            setCart(list);
            setLoading(false);
        }, () => setLoading(false));
        return () => unsubscribe();
    }, [currentUser]);

    const updateQty = async (itemId: string, delta: number) => {
        const item = cart.find(i => i.id === itemId);
        if (!item || !currentUser) return;
        const newQty = Math.max(1, item.qty + delta);
        try {
            const itemRef = doc(db, 'users', currentUser.uid, 'cart', itemId);
            await updateDoc(itemRef, { qty: newQty });
        } catch (error) {
            console.error("Error updating quantity:", error);
        }
    };

    const removeItem = (itemId: string) => {
        Alert.alert('Remove', 'Remove this item from your cart?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    if (!currentUser) return;
                    try {
                        const itemRef = doc(db, 'users', currentUser.uid, 'cart', itemId);
                        await deleteDoc(itemRef);
                    } catch (error) {
                        console.error("Error removing item:", error);
                    }
                },
            },
        ]);
    };

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <View style={[styles.cartItem, { backgroundColor: colors.card }]}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
                <View style={styles.itemHeader}>
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                        <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.itemSize, { color: colors.textLight }]}>{item.size}</Text>
                <View style={styles.itemFooter}>
                    <Text style={[styles.itemPrice, { color: COLORS.primary }]}>${item.price.toFixed(2)}</Text>
                    <View style={[styles.qtyRow, { backgroundColor: colors.background }]}>
                        <TouchableOpacity onPress={() => updateQty(item.id, -1)}><Ionicons name="remove" size={16} color={colors.text} /></TouchableOpacity>
                        <Text style={[styles.qtyText, { color: colors.text }]}>{item.qty}</Text>
                        <TouchableOpacity onPress={() => updateQty(item.id, 1)}><Ionicons name="add" size={16} color={colors.text} /></TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <LayoutContainer>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>My Cart</Text>
                    <TouchableOpacity><Ionicons name="search-outline" size={24} color={colors.text} /></TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View>
                ) : cart.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <>
                        <FlatList data={cart} keyExtractor={item => item.id} renderItem={renderCartItem} contentContainerStyle={styles.list} />
                        <View style={[styles.footer, { borderTopColor: colors.border }]}>
                            <View style={styles.totalRow}>
                                <Text style={[styles.totalLabel, { color: colors.textLight }]}>Total Price</Text>
                                <Text style={[styles.totalValue, { color: COLORS.primary }]}>${subtotal.toFixed(2)}</Text>
                            </View>
                            <Button title="Checkout" onPress={() => router.push('/(main)/checkout')} style={styles.checkoutBtn} />
                        </View>
                    </>
                )}
            </LayoutContainer>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
    headerTitle: { fontSize: 24, fontWeight: '700' },
    list: { padding: SPACING.lg },
    cartItem: { 
        flexDirection: 'row', 
        padding: SPACING.md, 
        borderRadius: 20, 
        marginBottom: SPACING.md, 
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
            },
            android: {
                elevation: 2,
            },
            web: {
                boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
            }
        })
    },
    itemImage: { width: 100, height: 100, borderRadius: 16 },
    itemDetails: { flex: 1, marginLeft: SPACING.md, justifyContent: 'space-between' },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemName: { fontSize: 18, fontWeight: '700' },
    itemSize: { fontSize: 14 },
    itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemPrice: { fontSize: 18, fontWeight: '700' },
    qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    qtyText: { fontSize: 14, fontWeight: '700' },
    footer: { padding: SPACING.lg, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 16 },
    totalRow: { flex: 1 },
    totalLabel: { fontSize: 12 },
    totalValue: { fontSize: 24, fontWeight: '700' },
    checkoutBtn: { flex: 1.5 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
