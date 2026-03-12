import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../src/config/firebase';
import { collection, addDoc, doc, updateDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY } from '../../src/constants/theme';
import TextField from '../../src/components/TextField';
import Checkbox from '../../src/components/Checkbox';
import Button from '../../src/components/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function AddAddressScreen() {
    const { colors } = useTheme();
    const { addressId, initialData: initialDataStr } = useLocalSearchParams();
    const initialData = initialDataStr ? JSON.parse(initialDataStr) : null;
    const { currentUser } = useAuth();
    const router = useRouter();

    const [name, setName] = useState(initialData?.name || '');
    const [address, setAddress] = useState(initialData?.address || initialData?.street || '');
    const [isDefault, setIsDefault] = useState(initialData?.isDefault || false);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!name || !address) { Alert.alert('Error', 'Please fill in all fields'); return; }
        setLoading(true);
        try {
            const addressData = { name, address, isDefault, updatedAt: new Date().toISOString() };
            const addressesRef = collection(db, 'users', currentUser.uid, 'addresses');
            if (isDefault) {
                const q = query(addressesRef, where('isDefault', '==', true));
                const querySnapshot = await getDocs(q);
                const batch = writeBatch(db);
                querySnapshot.forEach((document) => {
                    if (document.id !== addressId) batch.update(document.ref, { isDefault: false });
                });
                await batch.commit();
            }
            if (addressId) await updateDoc(doc(db, 'users', currentUser.uid, 'addresses', addressId), addressData);
            else await addDoc(addressesRef, { ...addressData, createdAt: new Date().toISOString() });
            router.back();
        } catch (error) {
            console.error("Error saving address:", error);
            Alert.alert("Error", "Failed to save address.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>{addressId ? 'Edit Address' : 'Add New Address'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.mapContainer}>
                    <View style={styles.mapBg}><Ionicons name="location" size={40} color={COLORS.primary} /><Text style={styles.mapText}>Map Preview</Text></View>
                    <View style={styles.pinContainer}><View style={styles.pinCircle}><Ionicons name="location" size={24} color={COLORS.white} /></View><View style={styles.pinPointer} /></View>
                </View>

                <View style={styles.form}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Address Details</Text>
                    <TextField label="Address Label" value={name} onChangeText={setName} placeholder="Home, Office, etc." />
                    <TextField label="Full Address" value={address} onChangeText={setAddress} placeholder="Enter your full address" multiline numberOfLines={3} />
                    <View style={styles.defaultRow}><Checkbox value={isDefault} onValueChange={setIsDefault} color={COLORS.primary} /><Text style={[styles.defaultLabel, { color: colors.text }]}>Make this as the default address</Text></View>
                </View>
            </ScrollView>
            <View style={styles.footer}><Button title={loading ? "Saving..." : "Add"} onPress={handleSave} style={{ width: '100%' }} disabled={loading} /></View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
    title: { fontSize: 24, fontWeight: '700' },
    scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
    mapContainer: { height: 200, borderRadius: 24, overflow: 'hidden', marginBottom: 24, position: 'relative' },
    mapBg: { flex: 1, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
    mapText: { marginTop: 8, color: COLORS.primary, fontWeight: '600' },
    pinContainer: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -15 }, { translateY: -30 }], alignItems: 'center' },
    pinCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.white },
    pinPointer: { width: 4, height: 10, backgroundColor: COLORS.primary, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 },
    form: { gap: 16 },
    sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
    defaultRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
    defaultLabel: { fontSize: 14, fontWeight: '600' },
    footer: { padding: SPACING.lg, position: 'absolute', bottom: 0, left: 0, right: 0 },
});
