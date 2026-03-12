import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

const CONTACTS = [
    { id: '1', name: 'Tynisha Obey', phone: '+1-300-555-0135', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80', invited: true },
    { id: '2', name: 'Florencio Dorrance', phone: '+1-202-555-0136', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80', invited: false },
    { id: '3', name: 'Chantel Bondy', phone: '+1-202-555-0137', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80', invited: false },
    { id: '4', name: 'Arvin Kyker', phone: '+1-202-555-0138', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80', invited: true },
    { id: '5', name: 'Queenie McFerren', phone: '+1-202-555-0139', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80', invited: false },
    { id: '6', name: 'Lia Gould', phone: '+1-202-555-0140', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80', invited: false },
    { id: '7', name: 'Kristyn Gentry', phone: '+1-202-555-0141', avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=100&q=80', invited: false },
];

export default function InviteFriendsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [contacts, setContacts] = useState(CONTACTS);

    const toggleInvite = (id) => {
        setContacts(prev => prev.map(c => c.id === id ? { ...c, invited: !c.invited } : c));
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Invite Friends</Text>
                <View style={{ width: 40 }} />
            </View>

            <FlatList
                data={contacts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.contactItem}>
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                        <View style={styles.contactInfo}>
                            <Text style={[styles.nameLabel, { color: colors.text }]}>{item.name}</Text>
                            <Text style={[styles.phoneLabel, { color: colors.textLight }]}>{item.phone}</Text>
                        </View>
                        <TouchableOpacity style={[styles.inviteBtn, item.invited && styles.invitedBtn, item.invited && { borderColor: COLORS.primary }]} onPress={() => toggleInvite(item.id)}>
                            <Text style={[styles.inviteText, item.invited && { color: COLORS.primary }]}>{item.invited ? 'Invited' : 'Invite'}</Text>
                        </TouchableOpacity>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
    title: { fontSize: 24, fontWeight: '700' },
    listContent: { padding: SPACING.lg },
    contactItem: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 16 },
    contactInfo: { flex: 1 },
    nameLabel: { fontSize: 16, fontWeight: '700' },
    phoneLabel: { fontSize: 12, marginTop: 2 },
    inviteBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.primary, minWidth: 80, alignItems: 'center' },
    invitedBtn: { backgroundColor: 'transparent', borderWidth: 1.5 },
    inviteText: { fontSize: 14, color: COLORS.white, fontWeight: '700' },
});
