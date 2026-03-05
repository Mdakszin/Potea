import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

const PIN_LENGTH = 4;

const Numpad = ({ onPressKey, onDelete }) => {
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
                                ? <Ionicons name="backspace-outline" size={28} color={COLORS.text} />
                                : <Text style={numpadStyles.keyText}>{key}</Text>}
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
    keyText: { fontSize: 28, fontWeight: '500', color: COLORS.text },
});

export default function WalletPinScreen({ route, navigation }) {
    const { amount } = route.params;
    const [pin, setPin] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const handleKey = (key) => {
        if (pin.length < PIN_LENGTH) setPin(pin + key);
    };
    const handleDelete = () => setPin(pin.slice(0, -1));

    const handleContinue = () => {
        if (pin.length === PIN_LENGTH) {
            setShowSuccess(true);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Enter Your PIN</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>Enter your PIN to confirm top up</Text>

                <View style={styles.pinRow}>
                    {[...Array(PIN_LENGTH)].map((_, i) => (
                        <View key={i} style={[styles.pinDot, i < pin.length && styles.pinDotFilled]} />
                    ))}
                </View>

                <Button
                    title="Continue"
                    onPress={handleContinue}
                    style={styles.continueBtn}
                    disabled={pin.length < PIN_LENGTH}
                />

                <Numpad onPressKey={handleKey} onDelete={handleDelete} />
            </View>

            <Modal transparent visible={showSuccess} animationType="fade">
                <View style={modal.overlay}>
                    <View style={modal.card}>
                        <View style={modal.iconBg}>
                            <View style={modal.iconInner}>
                                <Ionicons name="wallet-outline" size={60} color={COLORS.white} />
                            </View>
                            <View style={modal.checkBadge}>
                                <Ionicons name="checkmark" size={20} color={COLORS.white} />
                            </View>
                        </View>
                        <Text style={modal.title}>Top Up Successful!</Text>
                        <Text style={modal.subtitle}>You have successfully top up e-wallet for ${amount}</Text>

                        <Button
                            title="View E-Receipt"
                            onPress={() => {
                                setShowSuccess(false);
                                navigation.navigate('EReceipt', { transaction: { name: 'Top Up Wallet', amount, date: 'now', type: 'Top Up', isTopUp: true } });
                            }}
                            style={modal.btn}
                        />
                        <TouchableOpacity onPress={() => {
                            setShowSuccess(false);
                            navigation.navigate('EWallet');
                        }}>
                            <Text style={modal.cancel}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: 16,
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    headerTitle: { ...TYPOGRAPHY.h3 },
    content: { flex: 1, paddingHorizontal: SPACING.lg, alignItems: 'center', paddingTop: 60 },
    subtitle: { ...TYPOGRAPHY.body, textAlign: 'center', marginBottom: 40 },
    pinRow: { flexDirection: 'row', gap: 20, marginBottom: 60 },
    pinDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: COLORS.border },
    pinDotFilled: { backgroundColor: COLORS.text, borderColor: COLORS.text },
    continueBtn: { width: '100%', borderRadius: 30, marginBottom: SPACING.xl },
});

const modal = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    card: { backgroundColor: COLORS.white, borderRadius: 40, padding: 32, width: '100%', alignItems: 'center' },
    iconBg: { position: 'relative', marginBottom: 32 },
    iconInner: { width: 140, height: 140, borderRadius: 70, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
    checkBadge: {
        position: 'absolute', bottom: 10, right: 10,
        backgroundColor: '#2ECC71', width: 32, height: 32, borderRadius: 16,
        alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.white
    },
    title: { ...TYPOGRAPHY.h2, color: COLORS.primary, marginBottom: 16 },
    subtitle: { ...TYPOGRAPHY.body, textAlign: 'center', color: COLORS.textLight, marginBottom: 32 },
    btn: { width: '100%', borderRadius: 30, marginBottom: 20 },
    cancel: { ...TYPOGRAPHY.body, color: COLORS.textLight, fontWeight: '700' },
});
