import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TextField from '../components/TextField';
import Button from '../components/Button';
import Checkbox from '../components/Checkbox';

export default function AddAddressScreen({ navigation }) {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Add New Address</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Mock Map */}
                <View style={styles.mapContainer}>
                    <View style={styles.mapBg}>
                        <Ionicons name="location" size={40} color={COLORS.primary} />
                        <Text style={styles.mapText}>Map Preview</Text>
                    </View>
                    <View style={styles.pinContainer}>
                        <View style={styles.pinCircle}>
                            <Ionicons name="location" size={24} color={COLORS.white} />
                        </View>
                        <View style={styles.pinPointer} />
                    </View>
                </View>

                <View style={styles.form}>
                    <Text style={styles.sectionTitle}>Address Details</Text>
                    <TextField
                        placeholder="Address Name (e.g. Home)"
                        value={name}
                        onChangeText={setName}
                    />
                    <TextField
                        placeholder="Full Address"
                        value={address}
                        onChangeText={setAddress}
                        rightIcon="location-outline"
                    />

                    <View style={styles.defaultRow}>
                        <Checkbox
                            label="Set as default address"
                            checked={isDefault}
                            onPress={() => setIsDefault(!isDefault)}
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button title="Add" onPress={() => navigation.goBack()} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    backBtn: { padding: 4 },
    title: { ...TYPOGRAPHY.h3 },
    scrollContent: { paddingBottom: 100 },
    mapContainer: {
        height: 250, backgroundColor: COLORS.primaryLight,
        margin: SPACING.lg, borderRadius: 24, overflow: 'hidden',
        alignItems: 'center', justifyContent: 'center',
    },
    mapBg: { alignItems: 'center', opacity: 0.2 },
    mapText: { ...TYPOGRAPHY.h3, color: COLORS.primary, marginTop: 8 },
    pinContainer: { position: 'absolute', alignItems: 'center' },
    pinCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
        borderWidth: 3, borderColor: COLORS.white,
    },
    pinPointer: {
        width: 0, height: 0,
        borderLeftWidth: 8, borderLeftColor: 'transparent',
        borderRightWidth: 8, borderRightColor: 'transparent',
        borderTopWidth: 10, borderTopColor: COLORS.primary,
        marginTop: -2,
    },
    form: { paddingHorizontal: SPACING.lg },
    sectionTitle: { ...TYPOGRAPHY.h3, fontSize: 18, marginBottom: SPACING.md },
    defaultRow: { marginTop: SPACING.md },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl,
        backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
    },
});
