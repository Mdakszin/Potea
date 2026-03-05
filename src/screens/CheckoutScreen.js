import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    Image, TouchableOpacity
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

const SHIPPING_FEE = 2.99;

export default function CheckoutScreen({ route, navigation }) {
    const { cart = [], subtotal = 0 } = route.params || {};
    const [promoDiscount, setPromoDiscount] = useState(0);
    const total = subtotal + SHIPPING_FEE - promoDiscount;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Checkout</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── Shipping Address ── */}
                <SectionCard>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Shipping Address</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ShippingAddress')}>
                            <Text style={styles.changeText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.addressCard}>
                        <View style={styles.addressIconCircle}>
                            <Ionicons name="location" size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.addressInfo}>
                            <Text style={styles.addressName}>Andrew Ainsley</Text>
                            <Text style={styles.addressText}>3456 Maple Drive, Springfield, IL 62704, USA</Text>
                        </View>
                    </View>
                </SectionCard>

                {/* ── Order List ── */}
                <SectionCard>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Order List</Text>
                        <Text style={styles.itemCount}>{cart.length} items</Text>
                    </View>
                    {cart.map(item => (
                        <View key={item.cartId} style={styles.orderItem}>
                            <Image source={{ uri: item.image }} style={styles.orderImage} />
                            <View style={styles.orderInfo}>
                                <Text style={styles.orderName} numberOfLines={1}>{item.name}</Text>
                                <Text style={styles.orderMeta}>Size: {item.selectedSize}  ·  Qty: {item.qty}</Text>
                            </View>
                            <Text style={styles.orderPrice}>${(item.price * item.qty).toFixed(2)}</Text>
                        </View>
                    ))}
                </SectionCard>

                {/* ── Shipping Method ── */}
                <SectionCard>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Choose Shipping</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ChooseShipping')}>
                            <Text style={styles.changeText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.shippingOption}>
                        <View style={styles.shippingIconCircle}>
                            <Ionicons name="bicycle-outline" size={22} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.shippingName}>Regular  –  3-5 days</Text>
                            <Text style={styles.shippingDate}>Est. arrival: Mar 10 – 12</Text>
                        </View>
                        <Text style={styles.shippingPrice}>$2.99</Text>
                    </View>
                </SectionCard>

                {/* ── Promo Code ── */}
                <SectionCard>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Promo Code</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('PromoCode')}>
                            <Text style={styles.changeText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    {promoDiscount > 0
                        ? <View style={styles.promoApplied}>
                            <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                            <Text style={styles.promoAppliedText}>POTEA20  –  -${promoDiscount.toFixed(2)}</Text>
                        </View>
                        : <Text style={styles.promoEmpty}>No promo code applied</Text>
                    }
                </SectionCard>

                {/* ── Payment Method ── */}
                <SectionCard>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('PaymentMethod')}>
                            <Text style={styles.changeText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.paymentRow}>
                        <View style={styles.paymentIconCircle}>
                            <Ionicons name="card-outline" size={22} color={COLORS.primary} />
                        </View>
                        <Text style={styles.paymentText}>**** **** **** 4589</Text>
                    </View>
                </SectionCard>

                {/* ── Price Summary ── */}
                <SectionCard>
                    <Text style={styles.sectionTitle}>Price Details</Text>
                    <PriceLine label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                    <PriceLine label="Shipping" value={`$${SHIPPING_FEE.toFixed(2)}`} />
                    {promoDiscount > 0 && <PriceLine label="Discount" value={`-$${promoDiscount.toFixed(2)}`} highlight />}
                    <View style={styles.totalDivider} />
                    <PriceLine label="Total" value={`$${total.toFixed(2)}`} bold />
                </SectionCard>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Button
                    title={`Place Order  ($${total.toFixed(2)})`}
                    onPress={() => navigation.navigate('OrderSuccess')}
                    style={styles.placeOrderBtn}
                />
            </View>
        </SafeAreaView>
    );
}

const SectionCard = ({ children }) => <View style={sectionCard.container}>{children}</View>;
const sectionCard = StyleSheet.create({
    container: {
        marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
        borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
        padding: SPACING.md, backgroundColor: COLORS.white,
    },
});

const PriceLine = ({ label, value, highlight, bold }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={{ ...TYPOGRAPHY.body, color: bold ? COLORS.text : COLORS.textLight, fontWeight: bold ? '700' : '400' }}>{label}</Text>
        <Text style={{ ...TYPOGRAPHY.body, color: highlight ? '#FF4C4C' : bold ? COLORS.primary : COLORS.text, fontWeight: bold ? '700' : '600' }}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F8F8' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: SPACING.md,
        backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12,
        borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
    },
    title: { ...TYPOGRAPHY.h2 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    sectionTitle: { ...TYPOGRAPHY.h3, fontSize: 15 },
    changeText: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: '600' },
    itemCount: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight },

    addressCard: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
    addressIconCircle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
    },
    addressInfo: { flex: 1 },
    addressName: { ...TYPOGRAPHY.body, fontWeight: '700', marginBottom: 2 },
    addressText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, lineHeight: 18 },

    orderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    orderImage: { width: 56, height: 56, borderRadius: 10, backgroundColor: COLORS.primaryLight, marginRight: SPACING.sm },
    orderInfo: { flex: 1 },
    orderName: { ...TYPOGRAPHY.bodySmall, fontWeight: '600', marginBottom: 2 },
    orderMeta: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight },
    orderPrice: { ...TYPOGRAPHY.bodySmall, fontWeight: '700', color: COLORS.primary },

    shippingOption: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    shippingIconCircle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
    },
    shippingName: { ...TYPOGRAPHY.bodySmall, fontWeight: '600' },
    shippingDate: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight },
    shippingPrice: { ...TYPOGRAPHY.bodySmall, fontWeight: '700' },

    promoApplied: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    promoAppliedText: { ...TYPOGRAPHY.body, color: COLORS.primary, fontWeight: '600' },
    promoEmpty: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight },

    paymentRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    paymentIconCircle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
    },
    paymentText: { ...TYPOGRAPHY.body, fontWeight: '600' },
    totalDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, paddingTop: SPACING.md,
        backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
    },
    placeOrderBtn: { borderRadius: 30 },
});
