import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    Image, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const SHIPPING_FEE = 2.99;

export default function CheckoutScreen({ route, navigation }) {
    const { cart = [], subtotal = 0, selectedAddress: routeAddress, selectedShipping: routeShipping, selectedPayment: routePayment } = route.params || {};
    const { currentUser, userData } = useAuth();
    const { colors, isDark } = useTheme();

    const [selectedAddress, setSelectedAddress] = useState(routeAddress || null);
    const [selectedShipping, setSelectedShipping] = useState(routeShipping || { id: '2', type: 'Regular', icon: 'bicycle-outline', price: 2.99, days: '3-5 days', arrival: 'Mar 10 – 12' });
    const [selectedPayment, setSelectedPayment] = useState(routePayment || { id: 'wallet', label: 'Potea E-Wallet', method: 'wallet', icon: 'wallet-outline' });
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [loading, setLoading] = useState(!routeAddress);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const shippingFee = selectedShipping?.price || 0;
    const total = subtotal + shippingFee - promoDiscount;

    useEffect(() => {
        if (!selectedAddress && currentUser) {
            fetchDefaultAddress();
        }
    }, [currentUser, routeAddress]);

    useEffect(() => {
        if (routeShipping) setSelectedShipping(routeShipping);
    }, [routeShipping]);

    useEffect(() => {
        if (routePayment) setSelectedPayment(routePayment);
    }, [routePayment]);

    const fetchDefaultAddress = async () => {
        try {
            const q = query(
                collection(db, 'users', currentUser.uid, 'addresses'),
                where('isDefault', '==', true)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                setSelectedAddress({ id: doc.id, ...doc.data() });
            }
        } catch (error) {
            console.error("Error fetching default address:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            Alert.alert("Error", "Please select a shipping address");
            return;
        }

        if (selectedPayment.id === 'wallet') {
            const balance = userData?.balance || 0;
            if (balance < total) {
                Alert.alert("Insufficient Balance", "Your e-wallet balance is not enough. Please top up or choose another payment method.");
                return;
            }
            // Navigate to Pin screen for payment
            navigation.navigate('WalletPin', {
                amount: total,
                type: 'payment',
                orderData: {
                    cart,
                    subtotal,
                    shippingFee,
                    promoDiscount,
                    total,
                    selectedAddress,
                    selectedShipping
                }
            });
            return;
        }

        // Standard placement for other payment methods (simplified for now)
        setIsPlacingOrder(true);
        try {
            const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const batch = writeBatch(db);

            const orderRef = doc(db, 'orders', orderId);
            const orderData = {
                orderId,
                userId: currentUser.uid,
                items: cart,
                subtotal,
                shippingFee,
                promoDiscount,
                total,
                status: 'Processing',
                shippingAddress: selectedAddress,
                paymentMethod: selectedPayment.label,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            batch.set(orderRef, orderData);

            cart.forEach(item => {
                const cartItemRef = doc(db, 'users', currentUser.uid, 'cart', item.id);
                batch.delete(cartItemRef);
            });

            await batch.commit();
            navigation.navigate('OrderSuccess', { orderId, total });
        } catch (error) {
            console.error("Error placing order:", error);
            Alert.alert("Error", "Failed to place order. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const SectionCard = ({ children }) => (
        <View style={[sectionCard.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {children}
        </View>
    );

    const PriceLine = ({ label, value, highlight, bold }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ ...TYPOGRAPHY.body, color: bold ? colors.text : colors.textLight, fontWeight: bold ? '700' : '400' }}>{label}</Text>
            <Text style={{ ...TYPOGRAPHY.body, color: highlight ? '#FF4C4C' : bold ? COLORS.primary : colors.text, fontWeight: bold ? '700' : '600' }}>{value}</Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: isDark ? colors.background : '#F8F8F8' }]}>
            <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { borderColor: colors.border }]}>
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Checkout</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <SectionCard>
                    <View style={styles.sectionRow}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Address</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ShippingAddress')}>
                            <Text style={styles.changeText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.addressCard}>
                        <View style={styles.addressIconCircle}>
                            <Ionicons name="location" size={20} color={COLORS.primary} />
                        </View>
                        <View style={styles.addressInfo}>
                            {loading ? (
                                <ActivityIndicator size="small" color={COLORS.primary} style={{ alignSelf: 'flex-start' }} />
                            ) : selectedAddress ? (
                                <>
                                    <Text style={[styles.addressName, { color: colors.text }]}>{selectedAddress.name || selectedAddress.label}</Text>
                                    <Text style={[styles.addressText, { color: colors.textLight }]}>
                                        {selectedAddress.address || selectedAddress.street}, {selectedAddress.city} {selectedAddress.zipCode}
                                    </Text>
                                </>
                            ) : (
                                <Text style={[styles.addressText, { color: colors.textLight }]}>No address selected. Please add one.</Text>
                            )}
                        </View>
                    </View>
                </SectionCard>

                <SectionCard>
                    <View style={styles.sectionRow}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Order List</Text>
                        <Text style={[styles.itemCount, { color: colors.textLight }]}>{cart.length} items</Text>
                    </View>
                    {cart.map(item => (
                        <View key={item.cartId} style={styles.orderItem}>
                            <Image source={{ uri: item.image }} style={styles.orderImage} />
                            <View style={styles.orderInfo}>
                                <Text style={[styles.orderName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                                <Text style={[styles.orderMeta, { color: colors.textLight }]}>Size: {item.selectedSize}  ·  Qty: {item.qty}</Text>
                            </View>
                            <Text style={styles.orderPrice}>${(item.price * item.qty).toFixed(2)}</Text>
                        </View>
                    ))}
                </SectionCard>

                <SectionCard>
                    <View style={styles.sectionRow}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Shipping</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('ChooseShipping')}>
                            <Text style={styles.changeText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.shippingOption}>
                        <View style={styles.shippingIconCircle}>
                            <Ionicons name={selectedShipping?.icon || "bicycle-outline"} size={22} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.shippingName, { color: colors.text }]}>{selectedShipping?.type}  –  {selectedShipping?.days}</Text>
                            <Text style={[styles.shippingDate, { color: colors.textLight }]}>Est. arrival: {selectedShipping?.arrival}</Text>
                        </View>
                        <Text style={[styles.shippingPrice, { color: colors.text }]}>${selectedShipping?.price?.toFixed(2)}</Text>
                    </View>
                </SectionCard>

                <SectionCard>
                    <View style={styles.sectionRow}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Promo Code</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('PromoCode')}>
                            <Text style={styles.changeText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                    {promoDiscount > 0
                        ? <View style={styles.promoApplied}>
                            <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                            <Text style={styles.promoAppliedText}>POTEA20  –  -${promoDiscount.toFixed(2)}</Text>
                        </View>
                        : <Text style={[styles.promoEmpty, { color: colors.textLight }]}>No promo code applied</Text>
                    }
                </SectionCard>

                <SectionCard>
                    <View style={styles.sectionRow}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('PaymentMethod', { selectedId: selectedPayment.id })}>
                            <Text style={styles.changeText}>Change</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.paymentRow}>
                        <View style={styles.paymentIconCircle}>
                            <Ionicons name={selectedPayment.icon || "card-outline"} size={22} color={COLORS.primary} />
                        </View>
                        <Text style={[styles.paymentText, { color: colors.text }]}>{selectedPayment.label}</Text>
                    </View>
                </SectionCard>

                <SectionCard>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Details</Text>
                    <PriceLine label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
                    <PriceLine label="Shipping" value={`$${shippingFee.toFixed(2)}`} />
                    {promoDiscount > 0 && <PriceLine label="Discount" value={`-$${promoDiscount.toFixed(2)}`} highlight />}
                    <View style={[styles.totalDivider, { backgroundColor: colors.border }]} />
                    <PriceLine label="Total" value={`$${total.toFixed(2)}`} bold />
                </SectionCard>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <Button
                    title={`Place Order  ($${total.toFixed(2)})`}
                    onPress={handlePlaceOrder}
                    style={styles.placeOrderBtn}
                    isLoading={isPlacingOrder}
                    disabled={cart.length === 0}
                />
            </View>
        </SafeAreaView>
    );
}

const sectionCard = StyleSheet.create({
    container: {
        marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
        borderRadius: 16, borderWidth: 1,
        padding: SPACING.md,
    },
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12,
        borderWidth: 1, alignItems: 'center', justifyContent: 'center',
    },
    title: { ...TYPOGRAPHY.h2 },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
    sectionTitle: { ...TYPOGRAPHY.h3, fontSize: 15 },
    changeText: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontWeight: '600' },
    itemCount: { ...TYPOGRAPHY.bodySmall },

    addressCard: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
    addressIconCircle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.primary + '20', alignItems: 'center', justifyContent: 'center',
    },
    addressInfo: { flex: 1 },
    addressName: { ...TYPOGRAPHY.body, fontWeight: '700', marginBottom: 2 },
    addressText: { ...TYPOGRAPHY.bodySmall, lineHeight: 18 },

    orderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    orderImage: { width: 56, height: 56, borderRadius: 10, backgroundColor: COLORS.primary + '10', marginRight: SPACING.sm },
    orderInfo: { flex: 1 },
    orderName: { ...TYPOGRAPHY.bodySmall, fontWeight: '600', marginBottom: 2 },
    orderMeta: { ...TYPOGRAPHY.bodySmall },
    orderPrice: { ...TYPOGRAPHY.bodySmall, fontWeight: '700', color: COLORS.primary },

    shippingOption: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    shippingIconCircle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.primary + '10', alignItems: 'center', justifyContent: 'center',
    },
    shippingName: { ...TYPOGRAPHY.bodySmall, fontWeight: '600' },
    shippingDate: { ...TYPOGRAPHY.bodySmall },
    shippingPrice: { ...TYPOGRAPHY.bodySmall, fontWeight: '700' },

    promoApplied: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    promoAppliedText: { ...TYPOGRAPHY.body, color: COLORS.primary, fontWeight: '600' },
    promoEmpty: { ...TYPOGRAPHY.bodySmall },

    paymentRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    paymentIconCircle: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: COLORS.primary + '10', alignItems: 'center', justifyContent: 'center',
    },
    paymentText: { ...TYPOGRAPHY.body, fontWeight: '600' },
    totalDivider: { height: 1, marginVertical: SPACING.sm },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, paddingTop: SPACING.md,
        borderTopWidth: 1,
    },
    placeOrderBtn: { borderRadius: 30 },
});
