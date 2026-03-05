import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../components/Button';
import { Ionicons } from '@expo/vector-icons';

// Custom Numpad Component
const Numpad = ({ onPressKey, onDelete }) => {
    const keys = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['', '0', 'delete']
    ];

    return (
        <View style={styles.numpadContainer}>
            {keys.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.numpadRow}>
                    {row.map((key, colIndex) => (
                        <TouchableOpacity
                            key={colIndex}
                            style={styles.keyButton}
                            onPress={() => {
                                if (key === 'delete') onDelete();
                                else if (key !== '') onPressKey(key);
                            }}
                            disabled={key === ''}
                        >
                            {key === 'delete' ? (
                                <Ionicons name="backspace-outline" size={28} color={COLORS.text} />
                            ) : (
                                <Text style={styles.keyText}>{key}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
};

export default function CreatePinScreen({ navigation }) {
    const [pin, setPin] = useState('');
    const MAX_PIN_LENGTH = 4;

    const handleKeyPress = (key) => {
        if (pin.length < MAX_PIN_LENGTH) {
            setPin(pin + key);
        }
    };

    const handleDelete = () => {
        if (pin.length > 0) {
            setPin(pin.slice(0, -1));
        }
    };

    // Render the 4 dots
    const renderDots = () => {
        return (
            <View style={styles.dotsContainer}>
                {[...Array(MAX_PIN_LENGTH)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            pin.length > i ? styles.dotFilled : null,
                            pin.length === i ? styles.dotActive : null // Currently typing this one
                        ]}
                    >
                        {pin.length > i && <View style={styles.innerDot} />}
                        {/* For the current active one, the design shows the number typed. 
                          For simplicity, standard PIN dots usually just fill or show the number briefly. 
                          We will show the number for the active step if it was just typed (though normally obscured).
                          Let's stick to standard secure dots: filled if > i, outline if <= i. 
                          If you want the exact Figma look where the active box shows the number before turning to a dot:
                      */}
                        {pin.length > i && pin.length - 1 === i && (
                            <Text style={styles.latestPinText}>{pin[i]}</Text>
                        )}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create New PIN</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.textContainer}>
                    <Text style={styles.subtitle}>
                        Add a PIN number to make your account more secure.
                    </Text>
                </View>

                {renderDots()}

                <View style={{ flex: 1 }} /> {/* Spacer */}

            </ScrollView>
            <View style={styles.footerContainer}>
                <Button
                    title="Continue"
                    onPress={() => navigation.navigate('SetFingerprint')}
                    style={styles.continueButton}
                />
                <Numpad onPressKey={handleKeyPress} onDelete={handleDelete} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.sm,
        paddingBottom: SPACING.md,
    },
    backButton: {
        paddingRight: SPACING.md,
    },
    headerTitle: {
        ...TYPOGRAPHY.h3,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: SPACING.lg,
        alignItems: 'center',
    },
    textContainer: {
        marginTop: SPACING.xxl,
        marginBottom: SPACING.xxl * 2,
        paddingHorizontal: SPACING.xl,
    },
    subtitle: {
        ...TYPOGRAPHY.body,
        textAlign: 'center',
        lineHeight: 24,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: SPACING.md,
    },
    dot: {
        width: 70,
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dotActive: {
        borderColor: COLORS.primary,
        backgroundColor: COLORS.primaryLight + '20',
    },
    innerDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: COLORS.text,
        position: 'absolute', // Position absolute so it overlays if text is also there
    },
    latestPinText: {
        ...TYPOGRAPHY.h2,
        backgroundColor: COLORS.white, // Cover the inner dot briefly
        zIndex: 10,
    },
    footerContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    continueButton: {
        marginBottom: SPACING.xl,
    },
    numpadContainer: {
        width: '100%',
    },
    numpadRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: SPACING.lg,
    },
    keyButton: {
        width: 70,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    keyText: {
        fontSize: 28,
        fontWeight: '500',
        color: COLORS.text,
    }
});
