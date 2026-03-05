import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

const OTP_LENGTH = 4;
const RESEND_SECONDS = 55;

// Reusable inline numpad
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
    container: { width: '100%' },
    row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.lg },
    key: { width: 70, height: 50, alignItems: 'center', justifyContent: 'center' },
    keyText: { fontSize: 28, fontWeight: '500', color: COLORS.text },
});

export default function OTPVerificationScreen({ route, navigation }) {
    const { method } = route.params || {};
    const [otp, setOtp] = useState('');
    const [seconds, setSeconds] = useState(RESEND_SECONDS);
    const timerRef = useRef(null);

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setSeconds(s => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    const handleResend = () => {
        setOtp('');
        setSeconds(RESEND_SECONDS);
    };

    const handleKey = (key) => {
        if (otp.length < OTP_LENGTH) setOtp(otp + key);
    };
    const handleDelete = () => setOtp(otp.slice(0, -1));

    const maskedContact = method === 'sms' ? '+1 111 *****99' : 'and***iley@yourdomain.com';

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Forgot Password</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.subtitle}>
                    Code has been sent to {maskedContact}
                </Text>

                {/* OTP Boxes */}
                <View style={styles.otpRow}>
                    {[...Array(OTP_LENGTH)].map((_, i) => {
                        const isFilled = i < otp.length;
                        const isActive = i === otp.length;
                        return (
                            <View key={i} style={[styles.otpBox, isActive && styles.otpBoxActive, isFilled && styles.otpBoxFilled]}>
                                <Text style={styles.otpDigit}>{isFilled ? otp[i] : ''}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Resend */}
                <TouchableOpacity onPress={seconds === 0 ? handleResend : undefined} disabled={seconds > 0}>
                    <Text style={styles.resendText}>
                        {seconds > 0
                            ? `Resend code in  `
                            : 'Resend code'}
                        {seconds > 0 && (
                            <Text style={styles.timerText}>{String(seconds).padStart(2, '0')} s</Text>
                        )}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Button
                    title="Verify"
                    onPress={() => navigation.navigate('CreateNewPassword')}
                    style={styles.verifyButton}
                />
                <Numpad onPressKey={handleKey} onDelete={handleDelete} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.md,
    },
    backButton: { paddingRight: SPACING.md },
    headerTitle: { ...TYPOGRAPHY.h3 },
    content: { flex: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxl, alignItems: 'center' },
    subtitle: { ...TYPOGRAPHY.body, textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 24 },
    otpRow: {
        flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl,
    },
    otpBox: {
        width: 70, height: 56, borderRadius: 12,
        borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.card,
        alignItems: 'center', justifyContent: 'center',
    },
    otpBoxActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight + '30' },
    otpBoxFilled: { borderColor: COLORS.text, backgroundColor: COLORS.white },
    otpDigit: { ...TYPOGRAPHY.h2 },
    resendText: { ...TYPOGRAPHY.bodySmall, color: COLORS.text },
    timerText: { color: COLORS.primary, fontWeight: '700' },
    footer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
    verifyButton: { marginBottom: SPACING.xl },
});
