import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { COLORS, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { db } from '../../src/config/firebase';
import { doc, collection, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useRouter, useLocalSearchParams } from 'expo-router';

const PIN_LENGTH = 4;

interface NumpadProps {
    onPressKey: (key: string) => void;
    onDelete: () => void;
    colors: any;
}

const Numpad: React.FC<NumpadProps> = ({ onPressKey, onDelete, colors }) => {
    const rows = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'delete']];
    return (
        <View style={numpadStyles.container}>
            {rows.map((row, ri) => (
                <View key={ri} style={numpadStyles.row}>
                    {row.map((key, ci) => (
                        <TouchableOpacity 
                            key={ci} 
                            disabled={key === ''} 
                            style={numpadStyles.key} 
                            onPress={() => key === 'delete' ? onDelete() : key && onPressKey(key)}
                        >
                            {key === 'delete' ? (
                                <Ionicons name="backspace-outline" size={28} color={colors.text} />
                            ) : (
                                <Text style={[numpadStyles.keyText, { color: colors.text }]}>{key}</Text>
                            )}
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

export default function WalletPinScreen() {
    const { amount: amountStr, method, type, orderData: orderDataStr } = useLocalSearchParams();
    const amount = Number(amountStr);
    const orderData = orderDataStr && typeof orderDataStr === 'string' ? JSON.parse(orderDataStr) : null;
    const { colors } = useTheme();
    const { currentUser, userData, setUserData } = useAuth();
    const [pin, setPin] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleKey = (key: string) => { if (pin.length < PIN_LENGTH) setPin(pin + key); };
    const handleDelete = () => setPin(pin.slice(0, -1));

    const handleContinue = async () => {
        if (pin.length !== PIN_LENGTH || !currentUser) return;
        setLoading(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            await runTransaction(db, async (transaction) => {
                const userDoc = await transaction.get(userRef);
                if (!userDoc.exists()) throw new Error("User does not exist!");
                const currentBalance = userDoc.data().balance || 0;

                if (type === 'payment') {
                    if (currentBalance < amount) throw new Error("Insufficient balance");
                    transaction.update(userRef, { balance: currentBalance - amount });
                    const newTxRef = doc(collection(db, 'users', currentUser.uid, 'transactions'));
                    transaction.set(newTxRef, { 
                        name: 'Order Payment', 
                        amount, 
                        date: new Date().toLocaleDateString(), 
                        time: new Date().toLocaleTimeString(), 
                        type: 'Order', 
                        isTopUp: false, 
                        method: 'Potea E-Wallet', 
                        createdAt: serverTimestamp() 
                    });
                    const orderId = `ORD-${Date.now()}`;
                    transaction.set(doc(db, 'orders', orderId), { 
                        ...orderData, 
                        orderId, 
                        userId: currentUser.uid, 
                        paymentMethod: 'Potea E-Wallet', 
                        status: 0, 
                        createdAt: serverTimestamp(), 
                        updatedAt: serverTimestamp() 
                    });
                } else {
                    transaction.update(userRef, { balance: currentBalance + amount });
                    const newTxRef = doc(collection(db, 'users', currentUser.uid, 'transactions'));
                    transaction.set(newTxRef, { 
                        name: 'Top Up Wallet', 
                        amount, 
                        date: new Date().toLocaleDateString(), 
                        time: new Date().toLocaleTimeString(), 
                        type: 'Top Up', 
                        isTopUp: true, 
                        method: method ?? (typeof method === 'string' ? method : 'Credit Card'), 
                        createdAt: serverTimestamp() 
                    });
                }
            });
            
            const newBalance = type === 'payment' ? (userData?.balance || 0) - amount : (userData?.balance || 0) + amount;
            if (userData) {
                setUserData({ ...userData, balance: newBalance });
            }
            setShowSuccess(true);
        } catch (error: any) { 
            Alert.alert('Error', error.message); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>{type === 'payment' ? 'Payment' : 'Top Up'}</Text>
                <View style={{ width: 24 }} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.label, { color: colors.text, textAlign: 'center' }]}>
                    Enter your PIN to confirm {type === 'payment' ? 'payment' : 'top up'}
                </Text>
                <View style={styles.pinWrapper}>
                    {Array(PIN_LENGTH).fill(0).map((_, i) => (
                        <View key={i} style={[styles.pinDigit, { borderColor: pin.length > i ? COLORS.primary : colors.border }]}>
                            <View style={[styles.pinDot, { backgroundColor: pin.length > i ? COLORS.primary : 'transparent' }]} />
                        </View>
                    ))}
                </View>
                <Numpad onPressKey={handleKey} onDelete={handleDelete} colors={colors} />
                <Button 
                    title={loading ? "Processing..." : "Continue"} 
                    onPress={handleContinue} 
                    style={{ width: '100%', marginTop: 40 }} 
                    disabled={pin.length !== PIN_LENGTH || loading} 
                />
            </View>

            <Modal visible={showSuccess} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
                        <View style={styles.successIcon}>
                            <Ionicons name="checkmark-sharp" size={40} color={COLORS.white} />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            {type === 'payment' ? 'Payment Successful!' : 'Top Up Successful!'}
                        </Text>
                        <Text style={[styles.modalText, { color: colors.textLight }]}>
                            {type === 'payment' ? 'You have successfully paid for your order.' : 'Your wallet has been topped up successfully.'}
                        </Text>
                        <Button 
                            title="OK" 
                            onPress={() => { setShowSuccess(false); router.replace('/(tabs)/wallet'); }} 
                            style={{ width: '100%' }} 
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
    title: { fontSize: 24, fontWeight: '700' },
    content: { flex: 1, padding: SPACING.lg, alignItems: 'center', justifyContent: 'center' },
    label: { fontSize: 18, marginBottom: 40 },
    pinWrapper: { flexDirection: 'row', gap: 16, marginBottom: 40 },
    pinDigit: { width: 70, height: 60, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    pinDot: { width: 16, height: 16, borderRadius: 8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalCard: { width: '100%', borderRadius: 32, padding: 32, alignItems: 'center' },
    successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
    modalText: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
});
