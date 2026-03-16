import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import Button from '../../src/components/Button';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { db } from '../../src/config/firebase';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import useCheckoutStore from '../../src/store/useCheckoutStore';

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const STRIPE_SECRET_KEY = process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY;

export default function StripePaymentScreen() {
    const { 
        selectedAddress, 
        selectedShipping, 
        appliedPromo, 
        checkoutCart,
        resetCheckout
    } = useCheckoutStore();

    const cart = checkoutCart;
    const address = selectedAddress;
    const shipping = selectedShipping;
    const promo = appliedPromo;

    // Calculate total
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shippingFee = shipping?.price || 0;
    let promoDiscount = 0;
    if (promo) {
        if (promo.type === 'percentage') promoDiscount = subtotal * (promo.value / 100);
        else if (promo.type === 'fixed') promoDiscount = promo.value;
        promoDiscount = Math.min(promoDiscount, subtotal);
    }
    const amount = subtotal + shippingFee - promoDiscount;
    
    const { currentUser } = useAuth();
    const { colors } = useTheme();
    const router = useRouter();

    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCardNumberChange = (text) => {
        let formatted = text.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
        if (formatted.length <= 19) setCardNumber(formatted);
    };

    const handleExpiryChange = (text) => {
        let formatted = text.replace(/\D/g, '');
        if (formatted.length >= 2) formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
        setExpiry(formatted);
    };

    const handlePayment = async () => {
        if (!cardNumber || !expiry || !cvc || !name) { Alert.alert('Error', 'Please fill in all card details.'); return; }
        const expParts = expiry.split('/');
        if (expParts.length !== 2) { Alert.alert('Error', 'Invalid expiry format (MM/YY).'); return; }
        const expMonth = expParts[0];
        const expYear = '20' + expParts[1];
        setLoading(true);
        try {
            const tokenResponse = await fetch('https://api.stripe.com/v1/tokens', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${STRIPE_PUBLISHABLE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `card[number]=${cardNumber.replace(/\s/g, '')}&card[exp_month]=${expMonth}&card[exp_year]=${expYear}&card[cvc]=${cvc}`
            });
            const tokenData = await tokenResponse.json();
            if (tokenData.error) throw new Error(tokenData.error.message);

            const chargeResponse = await fetch('https://api.stripe.com/v1/charges', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `amount=${Math.round(amount * 100)}&currency=usd&source=${tokenData.id}&description=Potea Order for ${currentUser.uid}`
            });
            const chargeData = await chargeResponse.json();
            if (chargeData.error) throw new Error(chargeData.error.message);

            const orderId = 'ORD-' + Date.now();
            await runTransaction(db, async (transaction) => {
                const transRef = doc(collection(db, 'users', currentUser.uid, 'transactions'));
                transaction.set(transRef, { 
                    id: transRef.id, 
                    name: 'Order Payment (Stripe)', 
                    amount: Number(amount), 
                    isTopUp: false, 
                    date: new Date().toLocaleDateString(), 
                    createdAt: serverTimestamp(),
                    subtotal,
                    shippingFee,
                    promoDiscount
                });
                const orderRef = doc(db, 'users', currentUser.uid, 'orders', orderId);
                transaction.set(orderRef, { 
                    id: orderId, 
                    items: cart, 
                    address, 
                    shipping, 
                    payment: { label: 'Credit Card', method: 'card' }, 
                    subtotal,
                    shippingFee,
                    promoDiscount,
                    total: Number(amount), 
                    status: 'Active', 
                    createdAt: serverTimestamp() 
                });
            });
            resetCheckout();
            router.replace({ pathname: '/(main)/order-success', params: { orderId, total: amount } });
        } catch (error) {
            console.error("Payment error:", error);
            Alert.alert('Payment Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Payment Details</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}><Text style={[styles.label, { color: colors.text }]}>Card Holder Name</Text><TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={name} onChangeText={setName} placeholder="Enter your name" placeholderTextColor="#9E9E9E" /></View>
                <View style={styles.inputGroup}><Text style={[styles.label, { color: colors.text }]}>Card Number</Text><TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={cardNumber} onChangeText={handleCardNumberChange} keyboardType="numeric" placeholder="0000 0000 0000 0000" placeholderTextColor="#9E9E9E" maxLength={19} /></View>
                <View style={styles.row}>
                    <View style={[styles.inputGroup, { flex: 1 }]}><Text style={[styles.label, { color: colors.text }]}>Expiry Date</Text><TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={expiry} onChangeText={handleExpiryChange} keyboardType="numeric" placeholder="MM/YY" placeholderTextColor="#9E9E9E" maxLength={5} /></View>
                    <View style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}><Text style={[styles.label, { color: colors.text }]}>CVC</Text><TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={cvc} onChangeText={setCvc} keyboardType="numeric" placeholder="000" placeholderTextColor="#9E9E9E" maxLength={3} secureTextEntry /></View>
                </View>
                <Button title={loading ? "Processing..." : `Pay $${Number(amount).toFixed(2)}`} onPress={handlePayment} style={styles.payBtn} disabled={loading} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
    title: { fontSize: 24, fontWeight: '700' },
    form: { padding: SPACING.lg },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    input: { height: 56, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, fontSize: 16 },
    row: { flexDirection: 'row' },
    payBtn: { marginTop: 20 },
});
