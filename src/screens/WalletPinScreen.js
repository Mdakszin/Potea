import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, collection, addDoc, runTransaction, serverTimestamp } from 'firebase/firestore';

const PIN_LENGTH = 4;

const Numpad = ({ onPressKey, onDelete, colors }) => {
    const rows = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'delete']];
    return (
        <View style={numpadStyles.container}>
            {rows.map((row, ri) => (
                <View key={ri} style={numpadStyles.row}>
                    {row.map((key, ci) => (
                        <TouchableOpacity
                            key={ci} disabled={key === ''}
                            style={numpadStyles.key}
                            onPress={() => key === 'delete' ? onDelete() : key && onPressKey(key)}
                        >
                            {key === 'delete'
                                ? <Ionicons name="backspace-outline" size={28} color={colors.text} />
                                : <Text style={[numpadStyles.keyText, { color: colors.text }]}>{key}</Text>}
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
};

const numpadStyles = StyleSheet.create({
    container: { width: '100%', marginTop: SPACING.lg },
    row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.md },
    key: { width: 70, height: 50, alignItems: 'center', justifyContent: 'center' },
    keyText: { fontSize: 28, fontWeight: '500' },
});

export default function WalletPinScreen({ route, navigation }) {
    const { amount, method, type, orderData } = route.params;
    const { colors, isDark } = useTheme();
    const { currentUser } = useAuth();
    const [pin, setPin] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [transactionId, setTransactionId] = useState('');

    const handleKey = (key) => {
        if (pin.length < PIN_LENGTH) setPin(pin + key);
    };
    const handleDelete = () => setPin(pin.slice(0, -1));

    const handleContinue = async () => {
        if (pin.length !== PIN_LENGTH) return;

        setLoading(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const transactionsRef = collection(db, 'users', currentUser.uid, 'transactions');
            let createdOrderId = null;

            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) throw new Error("User does not exist!");

                if (type === 'payment') {
                    const currentBalance = userDoc.data().balance || 0;
                    if (currentBalance < amount) throw new Error("Insufficient balance");

                    transaction.update(userRef, { balance: currentBalance - amount });

                    const newTxRef = doc(transactionsRef);
                    transaction.set(newTxRef, {
                        name: 'Order Payment',
                        amount: amount,
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        type: 'Order',
                        isTopUp: false,
                        method: 'Potea E-Wallet',
                        createdAt: serverTimestamp(),
                    });

                    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                    createdOrderId = orderId;
                    const orderRef = doc(db, 'orders', orderId);
                    transaction.set(orderRef, {
                        ...orderData,
                        orderId,
                        userId: currentUser.uid,
                        paymentMethod: 'Potea E-Wallet',
                        status: 'Processing',
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp(),
                    });

                    if (orderData.cart) {
                        orderData.cart.forEach(item => {
                            const cartItemRef = doc(db, 'users', currentUser.uid, 'cart', item.id);
                            transaction.delete(cartItemRef);
                        });
                    }
                } else {
                    const newBalance = (userDoc.data().balance || 0) + amount;
                    transaction.update(userRef, { balance: newBalance });

                    const newTxRef = doc(transactionsRef);
                    const txData = {
                        name: 'Top Up Wallet',
                        amount: amount,
                        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        type: 'Top Up',
                        isTopUp: true,
                        method: method || 'Payment Method',
                        createdAt: serverTimestamp(),
                    };
                    transaction.set(newTxRef, txData);
                    setTransactionId(newTxRef.id);
                }
            });

            if (type === 'payment' && createdOrderId) {
                navigation.navigate('OrderSuccess', { orderId: createdOrderId, total: amount });
            } else {
                setShowSuccess(true);
            }
        } catch (error) {
            console.error("Transaction error:", error);
            Alert.alert("Error", error.message || "Failed to process transaction. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Enter Your PIN</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.subtitle, { color: colors.text }]}>Enter your PIN to confirm top up</Text>

                <View style={styles.pinRow}>
                    {[...Array(PIN_LENGTH)].map((_, i) => (
                        <View key={i} style={[styles.pinDot, { borderColor: colors.border }, i < pin.length && { backgroundColor: colors.text, borderColor: colors.text }]} />
                    ))}
                </View>

                <Button
                    title={loading ? "Processing..." : "Continue"}
                    onPress={handleContinue}
                    style={styles.continueBtn}
                    disabled={pin.length < PIN_LENGTH || loading}
                />

                <Numpad onPressKey={handleKey} onDelete={handleDelete} colors={colors} />
            </View>

            <Modal transparent visible={showSuccess} animationType="fade">
                <View style={[modal.overlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
                    <View style={[modal.card, { backgroundColor: colors.card }]}>
                        <View style={modal.iconBg}>
                            <View style={modal.iconInner}>
                                <Ionicons name="wallet-outline" size={60} color={COLORS.white} />
                            </View>
                            <View style={[modal.checkBadge, { borderColor: colors.card }]}>
                                <Ionicons name="checkmark" size={20} color={COLORS.white} />
                            </View>
                        </View>
                        <Text style={[modal.title, { color: COLORS.primary }]}>Top Up Successful!</Text>
                        <Text style={[modal.subtitle, { color: colors.textLight }]}>You have successfully top up e-wallet for ${amount}</Text>

                        <Button
                            title="View E-Receipt"
                            onPress={() => {
                                setShowSuccess(false);
                                navigation.navigate('EReceipt', {
                                    transaction: {
                                        id: transactionId,
                                        name: 'Top Up Wallet',
                                        amount,
                                        date: 'Today',
                                        type: 'Top Up',
                                        isTopUp: true
                                    }
                                });
                            }}
                            style={modal.btn}
                        />
                        <TouchableOpacity onPress={() => {
                            setShowSuccess(false);
                            navigation.navigate('EWallet');
                        }}>
                            <Text style={[modal.cancel, { color: COLORS.primary }]}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    headerTitle: { ...TYPOGRAPHY.h3 },
    content: { flex: 1, paddingHorizontal: SPACING.lg, alignItems: 'center', paddingTop: 60 },
    subtitle: { ...TYPOGRAPHY.body, textAlign: 'center', marginBottom: 40 },
    pinRow: { flexDirection: 'row', gap: 20, marginBottom: 60 },
    pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2 },
    continueBtn: { width: '100%', borderRadius: 30, marginBottom: SPACING.xl },
});

const modal = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    card: { borderRadius: 40, padding: 32, width: '100%', alignItems: 'center' },
    iconBg: { position: 'relative', marginBottom: 32 },
    iconInner: { width: 140, height: 140, borderRadius: 70, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    checkBadge: {
        position: 'absolute', bottom: 10, right: 10,
        backgroundColor: '#2ECC71', width: 32, height: 32, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center', borderWidth: 3,
    },
    title: { ...TYPOGRAPHY.h2, marginBottom: 16 },
    subtitle: { ...TYPOGRAPHY.body, textAlign: 'center', marginBottom: 32 },
    btn: { width: '100%', borderRadius: 30, marginBottom: 20 },
    cancel: { ...TYPOGRAPHY.body, fontWeight: '700' },
});
