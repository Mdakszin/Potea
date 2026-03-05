import React, { useState } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    Image, TouchableOpacity, Alert
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { PLANTS } from '../constants/data';

import LayoutContainer from '../components/LayoutContainer';

// Seed cart with 2 sample items
const INITIAL_CART = [
    { ...PLANTS[0], cartId: '1', qty: 1, selectedSize: 'M' },
    { ...PLANTS[1], cartId: '2', qty: 2, selectedSize: 'L' },
    { ...PLANTS[4], cartId: '3', qty: 1, selectedSize: 'M' },
];

const EmptyCart = ({ navigation }) => (
    <View style={empty.container}>
        <View style={empty.iconBg}>
            <Ionicons name="cart-outline" size={80} color={COLORS.primary} />
        </View>
        <Text style={empty.title}>Your Cart is Empty!</Text>
        <Text style={empty.subtitle}>Looks like you haven't added any plants yet. Start shopping now!</Text>
        <Button
            title="Explore Plants"
            onPress={() => navigation.navigate('Explore')}
            style={{ marginTop: SPACING.xl, width: '80%' }}
        />
    </View>
);

const empty = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl },
    iconBg: {
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    title: { ...TYPOGRAPHY.h2, textAlign: 'center', marginBottom: SPACING.sm },
    subtitle: { ...TYPOGRAPHY.body, color: COLORS.textLight, textAlign: 'center', lineHeight: 24 },
});

export default function CartScreen({ navigation }) {
    const [cart, setCart] = useState(INITIAL_CART);

    const updateQty = (cartId, delta) => {
        setCart(prev =>
            prev.map(item =>
                item.cartId === cartId
                    ? { ...item, qty: Math.max(1, item.qty + delta) }
                    : item
            )
        );
    };

    const removeItem = (cartId) => {
        Alert.alert('Remove', 'Remove this item from your cart?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => setCart(prev => prev.filter(i => i.cartId !== cartId)),
            },
        ]);
    };

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

    if (cart.length === 0) return <SafeAreaView style={styles.container}><LayoutContainer><EmptyCart navigation={navigation} /></LayoutContainer></SafeAreaView>;

    return (
        <SafeAreaView style={styles.container}>
            <LayoutContainer>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>My Cart</Text>
                    <View style={{ width: 40 }} />
                </View>

                <FlatList
                    data={cart}
                    keyExtractor={item => item.cartId}
                    contentContainerStyle={styles.list}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    renderItem={({ item }) => (
                        <View style={styles.cartItem}>
                            <Image source={{ uri: item.image }} style={styles.itemImage} />
                            <View style={styles.itemInfo}>
                                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.itemSize}>Size: {item.selectedSize}</Text>
                                <Text style={styles.itemPrice}>${(item.price * item.qty).toFixed(2)}</Text>
                            </View>
                            <View style={styles.qtyCol}>
                                <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(item.cartId)}>
                                    <Ionicons name="trash-outline" size={16} color="#FF4C4C" />
                                </TouchableOpacity>
                                <View style={styles.qtyControl}>
                                    <TouchableOpacity style={styles.qtyStep} onPress={() => updateQty(item.cartId, -1)}>
                                        <Ionicons name="remove" size={16} color={COLORS.text} />
                                    </TouchableOpacity>
                                    <Text style={styles.qtyText}>{item.qty}</Text>
                                    <TouchableOpacity style={styles.qtyStep} onPress={() => updateQty(item.cartId, 1)}>
                                        <Ionicons name="add" size={16} color={COLORS.text} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                    ListFooterComponent={
                        <View style={styles.promoRow}>
                            <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} />
                            <TouchableOpacity onPress={() => navigation.navigate('PromoCode')}>
                                <Text style={styles.promoText}>Enter Promo Code</Text>
                            </TouchableOpacity>
                            <Ionicons name="chevron-forward" size={18} color={COLORS.textLight} />
                        </View>
                    }
                />

                {/* Summary & Checkout */}
                <View style={styles.footer}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Shipping</Text>
                        <Text style={styles.summaryValue}>$2.99</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>${(subtotal + 2.99).toFixed(2)}</Text>
                    </View>
                    <Button
                        title={`Checkout  ($${(subtotal + 2.99).toFixed(2)})`}
                        onPress={() => navigation.navigate('Checkout', { cart, subtotal })}
                        style={styles.checkoutBtn}
                    />
                </View>
            </LayoutContainer>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.md,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12,
        borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
    },
    title: { ...TYPOGRAPHY.h2 },
    list: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
    separator: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
    cartItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm },
    itemImage: {
        width: 80, height: 80, borderRadius: 12,
        backgroundColor: COLORS.primaryLight, marginRight: SPACING.md,
    },
    itemInfo: { flex: 1 },
    itemName: { ...TYPOGRAPHY.body, fontWeight: '600', marginBottom: 4 },
    itemSize: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, marginBottom: 4 },
    itemPrice: { ...TYPOGRAPHY.body, color: COLORS.primary, fontWeight: '700' },
    qtyCol: { alignItems: 'flex-end', gap: SPACING.sm },
    qtyControl: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, overflow: 'hidden',
    },
    qtyStep: { padding: 6, backgroundColor: COLORS.card },
    qtyText: { paddingHorizontal: 12, ...TYPOGRAPHY.bodySmall, fontWeight: '700' },
    qtyBtn: {
        width: 30, height: 30, borderRadius: 8,
        backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center',
    },
    promoRow: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
        paddingVertical: SPACING.md, borderTopWidth: 1, borderColor: COLORS.border, marginTop: SPACING.sm,
    },
    promoText: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.primary, fontWeight: '600' },
    footer: {
        paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.xl,
        borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.white,
    },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
    summaryLabel: { ...TYPOGRAPHY.body, color: COLORS.textLight },
    summaryValue: { ...TYPOGRAPHY.body, fontWeight: '600' },
    totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm, marginBottom: SPACING.md },
    totalLabel: { ...TYPOGRAPHY.h3 },
    totalValue: { ...TYPOGRAPHY.h3, color: COLORS.primary },
    checkoutBtn: { borderRadius: 30 },
});
