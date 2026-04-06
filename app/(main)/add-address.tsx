import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../src/config/firebase';
import { collection, addDoc, doc, updateDoc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, SHADOWS } from '../../src/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';
import Button from '../../src/components/Button';
import useCheckoutStore from '../../src/store/useCheckoutStore';

export default function AddAddressScreen() {
    const { colors } = useTheme();
    const { addressId, initialData: initialDataStr } = useLocalSearchParams();
    const initialData = initialDataStr && typeof initialDataStr === 'string' ? JSON.parse(initialDataStr) : null;
    const { currentUser } = useAuth();
    const { setSelectedAddress } = useCheckoutStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const goBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(main)/home');
        }
    };

    const [label, setLabel] = useState(initialData?.name || initialData?.label || '');
    const [street, setStreet] = useState(initialData?.street || initialData?.address || '');
    const [apt, setApt] = useState(initialData?.apt || '');
    const [city, setCity] = useState(initialData?.city || '');
    const [state, setState] = useState(initialData?.state || '');
    const [postalCode, setPostalCode] = useState(initialData?.postalCode || '');
    const [country, setCountry] = useState(initialData?.country || '');

    const isFormValid = street.trim() && city.trim() && country.trim();

    const saveAddress = async () => {
        if (!isFormValid) {
            Alert.alert('Missing Info', 'Please fill in at least the street, city, and country.');
            return;
        }
        if (!currentUser) return;
        
        setLoading(true);
        try {
            const addressesRef = collection(db, 'users', currentUser.uid, 'addresses');

            // Unset any existing default
            const q = query(addressesRef, where('isDefault', '==', true));
            const querySnapshot = await getDocs(q);
            const batch = writeBatch(db);
            querySnapshot.forEach((document) => {
                if (document.id !== addressId) batch.update(document.ref, { isDefault: false });
            });
            await batch.commit();

            const fullAddress = [street, apt, city, state, postalCode, country].filter(Boolean).join(', ');

            const addressData = {
                name: label.trim() || 'Home',
                address: fullAddress,
                street: street.trim(),
                apt: apt.trim(),
                city: city.trim(),
                state: state.trim(),
                postalCode: postalCode.trim(),
                country: country.trim(),
                isDefault: true,
                updatedAt: new Date().toISOString()
            };

            let savedAddressId = addressId as string;
            if (addressId && typeof addressId === 'string') {
                await updateDoc(doc(db, 'users', currentUser.uid, 'addresses', addressId), addressData);
            } else {
                const docRef = await addDoc(addressesRef, { ...addressData, createdAt: new Date().toISOString() });
                savedAddressId = docRef.id;
            }
            setSelectedAddress({ id: savedAddressId, ...addressData });
            goBack();
        } catch (error) {
            console.error('Error saving address:', error);
            Alert.alert('Error', 'Failed to save address. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (
        iconName: keyof typeof Ionicons.glyphMap, 
        placeholder: string, 
        value: string, 
        onChangeText: (text: string) => void, 
        options: any = {}
    ) => (
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border || COLORS.border }]}>
            <Ionicons name={iconName} size={20} color={COLORS.primary} style={styles.inputIcon} />
            <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder={placeholder}
                placeholderTextColor={COLORS.textLight}
                value={value}
                onChangeText={onChangeText}
                autoCapitalize={options.autoCapitalize || 'words'}
                keyboardType={options.keyboardType || 'default'}
                returnKeyType={options.returnKeyType || 'next'}
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={goBack} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>
                    {addressId ? 'Edit Address' : 'Add New Address'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Location Icon Header */}
                    <View style={styles.iconHeader}>
                        <View style={styles.locationBubble}>
                            <Ionicons name="location" size={32} color={COLORS.white} />
                        </View>
                        <Text style={[styles.subtitle, { color: colors.textLight || COLORS.textLight }]}>
                            Enter your shipping address details
                        </Text>
                    </View>

                    {/* Label */}
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Address Label</Text>
                    {renderInput('bookmark-outline', 'e.g. Home, Work, Office', label, setLabel)}

                    {/* Street */}
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Street Address *</Text>
                    {renderInput('location-outline', 'Street address', street, setStreet)}

                    {/* Apt / Suite */}
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Apt / Suite</Text>
                    {renderInput('business-outline', 'Apt, Suite, Unit (optional)', apt, setApt)}

                    {/* City */}
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>City *</Text>
                    {renderInput('navigate-outline', 'City', city, setCity)}

                    {/* State & Postal Code Row */}
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: SPACING.sm }}>
                            <Text style={[styles.sectionLabel, { color: colors.text }]}>State / Province</Text>
                            {renderInput('map-outline', 'State', state, setState)}
                        </View>
                        <View style={{ flex: 1, marginLeft: SPACING.sm }}>
                            <Text style={[styles.sectionLabel, { color: colors.text }]}>Postal Code</Text>
                            {renderInput('mail-outline', 'Zip code', postalCode, setPostalCode, { keyboardType: 'default' })}
                        </View>
                    </View>

                    {/* Country */}
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>Country *</Text>
                    {renderInput('globe-outline', 'Country', country, setCountry, { returnKeyType: 'done' })}

                    {/* Default badge info */}
                    <View style={styles.defaultInfo}>
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                        <Text style={[styles.defaultInfoText, { color: colors.textLight || COLORS.textLight }]}>
                            This address will be set as your default shipping address.
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Save Button */}
            <View style={styles.footer}>
                <Button
                    title={loading ? 'Saving...' : (addressId ? 'Update Address' : 'Save Address')}
                    onPress={saveAddress}
                    style={[
                        styles.saveBtn,
                        !isFormValid && styles.saveBtnDisabled,
                    ] as any}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: 120,
    },
    iconHeader: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
        marginTop: SPACING.sm,
    },
    locationBubble: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
        ...SHADOWS.medium,
    },
    subtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        marginTop: SPACING.md,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: SPACING.md,
        height: 52,
        ...SHADOWS.small,
    },
    inputIcon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        fontSize: 15,
        fontWeight: '400',
    },
    row: {
        flexDirection: 'row',
    },
    defaultInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.lg,
        paddingHorizontal: SPACING.sm,
        gap: 8,
    },
    defaultInfoText: {
        fontSize: 13,
        flex: 1,
    },
    footer: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    saveBtn: {
        width: '100%',
    },
    saveBtnDisabled: {
        opacity: 0.5,
    },
});
