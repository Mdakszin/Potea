import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TextField from '../components/TextField';
import Button from '../components/Button';

export default function EditProfileScreen({ navigation }) {
    const [name, setName] = useState('Andrew Ainsley');
    const [nickname, setNickname] = useState('Andrew');
    const [email, setEmail] = useState('andrew_ainsley@yourdomain.com');
    const [phone, setPhone] = useState('+1 111 467 378 399');
    const [gender, setGender] = useState('Male');
    const [dob, setDob] = useState('12/27/1995');

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=200&q=80' }}
                            style={styles.avatar}
                        />
                        <TouchableOpacity style={styles.editBadge}>
                            <Ionicons name="pencil" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.form}>
                    <TextField
                        placeholder="Full Name"
                        value={name}
                        onChangeText={setName}
                    />
                    <TextField
                        placeholder="Nickname"
                        value={nickname}
                        onChangeText={setNickname}
                    />
                    <TextField
                        placeholder="Date of Birth"
                        value={dob}
                        onChangeText={setDob}
                        rightIcon="calendar-outline"
                    />
                    <TextField
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                        rightIcon="mail-outline"
                    />
                    <TextField
                        placeholder="Phone Number"
                        value={phone}
                        onChangeText={setPhone}
                        rightIcon="call-outline"
                    />
                    <TextField
                        placeholder="Gender"
                        value={gender}
                        onChangeText={setGender}
                        rightIcon="chevron-down"
                    />
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button title="Update" onPress={() => navigation.goBack()} />
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
    scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
    avatarSection: { alignItems: 'center', marginVertical: SPACING.xl },
    avatarWrapper: { position: 'relative' },
    avatar: { width: 120, height: 120, borderRadius: 60 },
    editBadge: {
        position: 'absolute', bottom: 4, right: 4,
        backgroundColor: COLORS.primary, width: 32, height: 32, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: COLORS.white,
    },
    form: { gap: SPACING.md },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl,
        backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
    },
});
