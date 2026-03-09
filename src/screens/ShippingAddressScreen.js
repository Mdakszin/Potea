import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { db } from '../config/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export default function ShippingAddressScreen({ navigation }) {
    const { currentUser } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchAddresses();
        }
    }, [currentUser]);

    const fetchAddresses = async () => {
        try {
            const q = query(collection(db, 'users', currentUser.uid, 'addresses'));
            const querySnapshot = await getDocs(q);
            const addressList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setAddresses(addressList);
        } catch (error) {
            console.error("Error fetching addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAddress = (address) => {
        // Navigate back to Checkout with the selected address
        navigation.navigate('Checkout', { selectedAddress: address });
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.addressCard}
            onPress={() => handleSelectAddress(item)}
        >
            <View style={styles.addressLeft}>
                <View style={[styles.iconContainer, item.isDefault && styles.iconContainerActive]}>
                    <Ionicons name="location" size={20} color={item.isDefault ? COLORS.white : COLORS.primary} />
                </View>
                <View style={styles.addressInfo}>
                    <View style={styles.labelRow}>
                        <Text style={styles.addressLabel}>{item.name || item.label}</Text>
                        {item.isDefault && (
                            <View style={styles.defaultBadge}>
                                <Text style={styles.defaultText}>Default</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.addressText}>{item.address || item.street}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('AddAddress', { addressId: item.id, initialData: item })}>
                <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Shipping Address</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No addresses found. Please add one.</Text>
                        </View>
                    }
                />
            )}

            <View style={styles.footer}>
                <Button title="Add New Address" onPress={() => navigation.navigate('AddAddress')} />
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
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: SPACING.lg, paddingBottom: 100 },
    addressCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.lg,
        marginBottom: SPACING.md, ...SHADOWS.small,
        borderWidth: 1, borderColor: COLORS.border,
    },
    addressLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 16 },
    iconContainer: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
    },
    iconContainerActive: { backgroundColor: COLORS.primary },
    addressInfo: { flex: 1 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    addressLabel: { ...TYPOGRAPHY.h3, fontSize: 16 },
    defaultBadge: {
        backgroundColor: COLORS.primary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
    },
    defaultText: { ...TYPOGRAPHY.bodySmall, color: COLORS.primary, fontSize: 10, fontWeight: '700' },
    addressText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textLight, lineHeight: 18 },
    emptyContainer: { alignItems: 'center', marginTop: 40 },
    emptyText: { ...TYPOGRAPHY.body, color: COLORS.textLight },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl,
        backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
    },
});
