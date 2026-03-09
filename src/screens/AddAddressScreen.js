import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../config/firebase';
import { collection, addDoc, doc, updateDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/theme';
import TextField from '../components/TextField';
import Checkbox from '../components/Checkbox';
import Button from '../components/Button';

export default function AddAddressScreen({ route, navigation }) {
    const { addressId, initialData } = route.params || {};
    const { currentUser } = useAuth();

    const [name, setName] = useState(initialData?.name || '');
    const [address, setAddress] = useState(initialData?.address || initialData?.street || '');
    const [isDefault, setIsDefault] = useState(initialData?.isDefault || false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !address) {
            alert('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const addressData = {
                name,
                address,
                isDefault,
                updatedAt: new Date().toISOString(),
            };

            const addressesRef = collection(db, 'users', currentUser.uid, 'addresses');

            // If setting as default, unset others first
            if (isDefault) {
                const q = query(addressesRef, where('isDefault', '==', true));
                const querySnapshot = await getDocs(q);
                const batch = writeBatch(db);
                querySnapshot.forEach((document) => {
                    if (document.id !== addressId) {
                        batch.update(document.ref, { isDefault: false });
                    }
                });
                await batch.commit();
            }

            if (addressId) {
                // Update
                const addrDoc = doc(db, 'users', currentUser.uid, 'addresses', addressId);
                await updateDoc(addrDoc, addressData);
            } else {
                // Add
                await addDoc(addressesRef, {
                    ...addressData,
                    createdAt: new Date().toISOString(),
                });
            }

            navigation.goBack();
        } catch (error) {
            console.error("Error saving address:", error);
            alert("Failed to save address. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>{addressId ? 'Edit Address' : 'Add New Address'}</Text>
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
                <Button
                    title={addressId ? "Update" : "Add"}
                    onPress={handleSave}
                    isLoading={loading}
                />
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
