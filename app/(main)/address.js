import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import { db } from '../../src/config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../../src/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function AddressScreen() {
    const { currentUser } = useAuth();
    const { colors } = useTheme();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!currentUser) return;
        const q = query(collection(db, 'users', currentUser.uid, 'addresses'), orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            list.sort((a, b) => b.isDefault - a.isDefault);
            setAddresses(list);
            setLoading(false);
        }, (error) => { setLoading(false); });
        return () => unsubscribe();
    }, [currentUser]);

    const renderItem = ({ item }) => (
        <TouchableOpacity style={[styles.addressCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push({ pathname: '/(main)/add-address', params: { addressId: item.id, initialData: JSON.stringify(item) } })}>
            <View style={styles.addressLeft}>
                <View style={[styles.iconContainer, item.isDefault && styles.iconContainerActive]}>
                    <Ionicons name="location" size={20} color={item.isDefault ? COLORS.white : COLORS.primary} />
                </View>
                <View style={styles.addressInfo}>
                    <View style={styles.labelRow}>
                        <Text style={[styles.addressLabel, { color: colors.text }]}>{item.name || item.label}</Text>
                        {item.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>}
                    </View>
                    <Text style={[styles.addressText, { color: colors.textLight }]}>{item.address || item.street}</Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => router.push({ pathname: '/(main)/add-address', params: { addressId: item.id, initialData: JSON.stringify(item) } })}>
                <Ionicons name="pencil-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Address</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? <View style={styles.centered}><ActivityIndicator size="large" color={COLORS.primary} /></View> : (
                <FlatList data={addresses} keyExtractor={item => item.id} renderItem={renderItem} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.textLight, marginTop: 40 }}>No addresses saved yet.</Text>} />
            )}
            <View style={styles.footer}><Button title="Add New Address" onPress={() => router.push('/(main)/add-address')} style={{ width: '100%' }} /></View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    title: { fontSize: 24, fontWeight: '700' },
    list: { padding: SPACING.lg, paddingBottom: 100 },
    addressCard: { flexDirection: 'row', padding: 16, borderRadius: 24, borderWidth: 1, marginBottom: 16, alignItems: 'center' },
    addressLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
    iconContainer: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    iconContainerActive: { backgroundColor: COLORS.primary },
    addressInfo: { flex: 1 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    addressLabel: { fontSize: 18, fontWeight: '700' },
    defaultBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    defaultText: { fontSize: 10, color: COLORS.primary, fontWeight: '700' },
    addressText: { fontSize: 14, marginTop: 4 },
    footer: { padding: SPACING.lg, position: 'absolute', bottom: 0, left: 0, right: 0 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
