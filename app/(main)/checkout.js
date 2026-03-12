import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    Image, TouchableOpacity, ActivityIndicator, Alert
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import { db } from '../../src/config/firebase';
import { collection, query, where, getDocs, doc, setDoc, runTransaction, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CheckoutScreen() {
    const { currentUser, userData } = useAuth();
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const params = useLocalSearchParams();

    const [cart, setCart] = useState([]);
    const [address, setAddress] = useState(null);
    const [shipping, setShipping] = useState({ id: '2', type: 'Regular', icon: 'bicycle-outline', price: 2.99, days: '3-5 days', arrival: 'Mar 10 – 12' });
    const [payment, setPayment] = useState({ id: 'wallet', label: 'Potea E-Wallet', method: 'wallet', icon: 'wallet-outline' });
    const [promo, setPromo] = useState(null);
    const [loadingAddr, setLoadingAddr] = useState(true);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        const cartRef = collection(db, 'users', currentUser.uid, 'cart');
        const unsubscribe = onSnapshot(cartRef, (snapshot) => {
            const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setCart(items);
        });
        return () => unsubscribe();
    }, [currentUser]);

    useEffect(() => {
        if (!currentUser) return;
        const fetchDefaultAddress = async () => {
            try {
                const q = query(collection(db, 'users', currentUser.uid, 'addresses'), where('isDefault', '==', true));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const docSnap = querySnapshot.docs[0];
                    if (!address) setAddress({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching default address:", error);
            } finally {
                setLoadingAddr(false);
            }
        };
        fetchDefaultAddress();
    }, [currentUser]);

    useEffect(() => {
        if (params.selectedAddress) setAddress(JSON.parse(params.selectedAddress));
        if (params.selectedShipping) setShipping(JSON.parse(params.selectedShipping));
        if (params.selectedPayment) setPayment(JSON.parse(params.selectedPayment));
        if (params.appliedPromo) setPromo(JSON.parse(params.appliedPromo));
    }, [params]);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shippingFee = shipping?.price || 0;
    let promoDiscount = 0;
    if (promo) {
        if (promo.type === 'percentage') promoDiscount = subtotal * (promo.value / 100);
        else if (promo.type === 'fixed') promoDiscount = promo.value;
        promoDiscount = Math.min(promoDiscount, subtotal);
    }
    const total = subtotal + shippingFee - promoDiscount;

    const handlePlaceOrder = async () => {
        if (!address) { Alert.alert('Error', 'Please select a shipping address.'); return; }
        if (payment.method === 'wallet' && (userData?.balance || 0) < total) {
            Alert.alert('Insufficient Balance', 'Your wallet balance is low. Please top up or choose another payment method.');
            return;
        }
        setIsPlacingOrder(true);
        try {
            if (payment.method === 'wallet') {
                await runTransaction(db, async (transaction) => {
                    const userRef = doc(db, 'users', currentUser.uid);
                    const userDoc = await transaction.get(userRef);
                    const newBalance = (userDoc.data().balance || 0) - total;
                    transaction.update(userRef, { balance: newBalance });
                    const orderId = 'ORD-' + Date.now();
                    const orderRef = doc(db, 'users', currentUser.uid, 'orders', orderId);
                    transaction.set(orderRef, { id: orderId, items: cart, address, shipping, payment, subtotal, shippingFee, promoDiscount, total, status: 'Active', createdAt: serverTimestamp() });
                    const transRef = doc(collection(db, 'users', currentUser.uid, 'transactions'));
                    transaction.set(transRef, { id: transRef.id, name: 'Order Payment', amount: total, isTopUp: false, date: new Date().toLocaleDateString(), createdAt: serverTimestamp() });
                });
            } else if (payment.method === 'card') {
                router.push({ pathname: '/(main)/stripe-payment', params: { amount: total, address: JSON.stringify(address), shipping: JSON.stringify(shipping), promo: JSON.stringify(promo), cart: JSON.stringify(cart) } });
                setIsPlacingOrder(false);
                return;
            }
            router.replace({ pathname: '/(main)/order-success', params: { orderId: 'ORD-' + Date.now() } });
        } catch (error) {
            console.error("Order error:", error);
            Alert.alert('Error', 'Checkout failed. Please try again.');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
                <TouchableOpacity><Ionicons name="ellipsis-horizontal-circle" size={24} color={colors.text} /></TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Address</Text>
                <TouchableOpacity style={[styles.addressCard, { backgroundColor: colors.card }]} onPress={() => router.push('/(main)/shipping-address')}>
                    <View style={styles.iconCircle}><Ionicons name="location" size={24} color={COLORS.primary} /></View>
                    <View style={styles.addressInfo}>
                        <Text style={[styles.addressLabel, { color: colors.text }]}>{address ? address.label : 'Select Address'}</Text>
                        <Text style={[styles.addressText, { color: colors.textLight }]} numberOfLines={1}>{address ? address.street : 'Tap to select a shipping address'}</Text>
                    </View>
                    <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>

                <View style={styles.divider} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Order List</Text>
                {cart.map(item => (
                    <View key={item.id} style={[styles.orderItem, { backgroundColor: colors.card }]}>
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                        <View style={styles.itemContent}>
                            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                            <Text style={[styles.itemSize, { color: colors.textLight }]}>{item.size} | Qty: {item.qty}</Text>
                            <Text style={[styles.itemPrice, { color: COLORS.primary }]}>${(item.price * item.qty).toFixed(2)}</Text>
                        </View>
                    </View>
                ))}

                <View style={styles.divider} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Shipping</Text>
                <TouchableOpacity style={[styles.shippingCard, { backgroundColor: colors.card }]} onPress={() => router.push('/(main)/choose-shipping')}>
                    <Ionicons name={shipping.icon} size={24} color={COLORS.primary} />
                    <View style={styles.shippingInfo}>
                        <Text style={[styles.shippingType, { color: colors.text }]}>{shipping.type}</Text>
                        <Text style={[styles.shippingDays, { color: colors.textLight }]}>Estimated Arrival, {shipping.arrival}</Text>
                    </View>
                    <Text style={[styles.shippingPrice, { color: COLORS.primary }]}>${shipping.price.toFixed(2)}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.divider} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
                <TouchableOpacity style={[styles.shippingCard, { backgroundColor: colors.card }]} onPress={() => router.push('/(main)/payment-method')}>
                    <Ionicons name={payment.icon} size={24} color={COLORS.primary} />
                    <Text style={[styles.paymentLabel, { color: colors.text }]}>{payment.label}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.text} style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>

                <View style={styles.divider} />
                <TouchableOpacity style={[styles.promoCard, { backgroundColor: colors.card }]} onPress={() => router.push('/(main)/promo-code')}>
                    <Ionicons name="pricetag-outline" size={24} color={COLORS.primary} />
                    <Text style={[styles.promoLabel, { color: colors.text }]}>{promo ? `Promo: ${promo.code}` : 'Enter Promo Code'}</Text>
                    <Ionicons name="add" size={24} color={COLORS.primary} />
                </TouchableOpacity>

                <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
                    <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.textLight }]}>Amount</Text><Text style={[styles.summaryValue, { color: colors.text }]}>${subtotal.toFixed(2)}</Text></View>
                    <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.textLight }]}>Shipping</Text><Text style={[styles.summaryValue, { color: colors.text }]}>${shippingFee.toFixed(2)}</Text></View>
                    {promoDiscount > 0 && <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: colors.textLight }]}>Promo</Text><Text style={[styles.summaryValue, { color: "#FF4D4D" }]}>-${promoDiscount.toFixed(2)}</Text></View>}
                    <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryRow}><Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text><Text style={[styles.totalValue, { color: colors.text }]}>${total.toFixed(2)}</Text></View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <Button title={isPlacingOrder ? "Placing Order..." : "Continue to Payment"} onPress={handlePlaceOrder} style={styles.footerBtn} disabled={isPlacingOrder} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
    headerTitle: { fontSize: 24, fontWeight: '700' },
    content: { padding: SPACING.lg, paddingBottom: 100 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
    addressCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderRadius: 20, marginBottom: 24 },
    iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    addressInfo: { flex: 1 },
    addressLabel: { fontSize: 16, fontWeight: '700' },
    addressText: { fontSize: 14, marginTop: 4 },
    divider: { height: 1, backgroundColor: COLORS.border + '30', marginVertical: 24 },
    orderItem: { flexDirection: 'row', padding: 12, borderRadius: 16, marginBottom: 12 },
    itemImage: { width: 80, height: 80, borderRadius: 12 },
    itemContent: { flex: 1, marginLeft: 16, justifyContent: 'center' },
    itemName: { fontSize: 16, fontWeight: '700' },
    itemSize: { fontSize: 13, marginTop: 4 },
    itemPrice: { fontSize: 16, fontWeight: '700', marginTop: 8 },
    shippingCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderRadius: 20 },
    shippingInfo: { flex: 1, marginLeft: 16 },
    shippingType: { fontSize: 16, fontWeight: '700' },
    shippingDays: { fontSize: 13, marginTop: 4 },
    shippingPrice: { fontSize: 18, fontWeight: '700', marginRight: 12 },
    paymentLabel: { fontSize: 16, fontWeight: '700', marginLeft: 16 },
    promoCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, borderRadius: 20, gap: 16 },
    promoLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
    summaryCard: { padding: SPACING.lg, borderRadius: 24, marginTop: 24 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { fontSize: 14 },
    summaryValue: { fontSize: 16, fontWeight: '700' },
    summaryDivider: { height: 1, marginVertical: 12 },
    totalLabel: { fontSize: 16, fontWeight: '700' },
    totalValue: { fontSize: 18, fontWeight: '700' },
    footer: { padding: SPACING.lg, borderTopWidth: 1 },
    footerBtn: { width: '100%' },
});
