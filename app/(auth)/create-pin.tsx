import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface NumpadProps {
    onPressKey: (key: string) => void;
    onDelete: () => void;
}

const Numpad: React.FC<NumpadProps> = ({ onPressKey, onDelete }) => {
    const keys = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'delete']];
    return (
        <View style={styles.numpadContainer}>
            {keys.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.numpadRow}>
                    {row.map((key, colIndex) => (
                        <TouchableOpacity
                            key={colIndex}
                            style={styles.keyButton}
                            onPress={() => key === 'delete' ? onDelete() : key !== '' && onPressKey(key)}
                            disabled={key === ''}
                        >
                            {key === 'delete'
                                ? <Ionicons name="backspace-outline" size={28} color={COLORS.text} />
                                : <Text style={styles.keyText}>{key}</Text>}
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
};

export default function CreatePinScreen() {
    const [pin, setPin] = useState('');
    const MAX_PIN_LENGTH = 4;
    const router = useRouter();

    const handleKeyPress = (key: string) => {
        if (pin.length < MAX_PIN_LENGTH) setPin(pin + key);
    };
    const handleDelete = () => {
        if (pin.length > 0) setPin(pin.slice(0, -1));
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create New PIN</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.textContainer}>
                    <Text style={styles.subtitle}>Add a PIN number to make your account more secure.</Text>
                </View>
                <View style={styles.dotsContainer}>
                    {[...Array(MAX_PIN_LENGTH)].map((_, i) => (
                        <View key={i} style={[styles.dot, pin.length > i && styles.dotFilled, pin.length === i && styles.dotActive]}>
                            {pin.length > i && <View style={styles.innerDot} />}
                            {/* @ts-ignore - access by index is OK */}
                            {pin.length > i && pin.length - 1 === i && <Text style={styles.latestPinText}>{pin[i]}</Text>}
                        </View>
                    ))}
                </View>
                <View style={{ flex: 1 }} />
            </ScrollView>
            <View style={styles.footerContainer}>
                <Button title="Continue" onPress={() => router.push('/(auth)/set-fingerprint')} style={styles.continueButton} />
                <Numpad onPressKey={handleKeyPress} onDelete={handleDelete} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, paddingBottom: SPACING.md },
    backButton: { paddingRight: SPACING.md },
    headerTitle: { ...TYPOGRAPHY.h3 },
    scrollContent: { flexGrow: 1, paddingHorizontal: SPACING.lg, alignItems: 'center' },
    textContainer: { marginTop: SPACING.xxl, marginBottom: SPACING.xxl * 2, paddingHorizontal: SPACING.xl },
    subtitle: { ...TYPOGRAPHY.body, textAlign: 'center', lineHeight: 24 },
    dotsContainer: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.md },
    dot: { width: 70, height: 56, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
    dotActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight + '20' },
    dotFilled: {}, // Placeholder if needed
    innerDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.text, position: 'absolute' },
    latestPinText: { ...TYPOGRAPHY.h2, backgroundColor: COLORS.white, zIndex: 10 },
    footerContainer: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
    continueButton: { marginBottom: SPACING.xl },
    numpadContainer: { width: '100%' },
    numpadRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: SPACING.lg },
    keyButton: { width: 70, height: 50, alignItems: 'center', justifyContent: 'center' },
    keyText: { fontSize: 28, fontWeight: '500', color: COLORS.text }
});
