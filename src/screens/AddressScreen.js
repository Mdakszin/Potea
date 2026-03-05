import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

const INITIAL_ADDRESSES = [
    { id: '1', label: 'Home', address: '61480 Sunbrook Park, PC 5679', isDefault: true },
    { id: '2', label: 'Office', address: '6993 Meadow Valley Terrace, PC 5679', isDefault: false },
    { id: '3', label: 'Apartment', address: '8274 Rocky Road, PC 5679', isDefault: false },
    { id: '4', label: 'Parent\'s House', address: '5279 Middle Earth, PC 5679', isDefault: false },
];

export default function AddressScreen({ navigation }) {
    const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.addressCard}>
            <View style={styles.addressLeft}>
                <View style={[styles.iconContainer, item.isDefault && styles.iconContainerActive]}>
                    <Ionicons name="location" size={20} color={item.isDefault ? COLORS.white : COLORS.primary} />
                </View>
                <View style={styles.addressInfo}>
                    <View style={styles.labelRow}>
                        <Text style={styles.addressLabel}>{item.label}</Text>
                        {item.isDefault && (
                            <View style={styles.defaultBadge}>
                                <Text style={styles.defaultText}>Default</Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.addressText}>{item.address}</Text>
                </View>
            </View>
            <TouchableOpacity>
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
                <Text style={styles.title}>Address</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={addresses}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
            />

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
    listContent: { padding: SPACING.lg, paddingBottom: 100 },
    addressCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: COLORS.white, borderRadius: 20, padding: SPACING.lg,
        marginBottom: SPACING.md, elevation: 2, shadowColor: '#000',
        shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
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
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl,
        backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
    },
});
