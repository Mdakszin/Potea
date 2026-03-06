import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function EditProfileScreen({ navigation }) {
    const { currentUser, userData, setUserData } = useAuth();

    const [name, setName] = useState(userData?.name || '');
    const [nickname, setNickname] = useState(userData?.nickname || '');
    const [email, setEmail] = useState(userData?.email || currentUser?.email || '');
    const [phone, setPhone] = useState(userData?.phone || '');
    const [gender, setGender] = useState(userData?.gender || '');
    const [dob, setDob] = useState(userData?.dob || '');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userData) {
            setName(userData.name || '');
            setNickname(userData.nickname || '');
            setEmail(userData.email || '');
            setPhone(userData.phone || '');
            setGender(userData.gender || '');
            setDob(userData.dob || '');
        }
    }, [userData]);

    const handleUpdate = async () => {
        if (!currentUser) return;

        try {
            setLoading(true);
            const userRef = doc(db, 'users', currentUser.uid);

            const updatedData = {
                name,
                nickname,
                phone,
                gender,
                dob,
                // Email is usually handled via Auth provider separately, but saving here for reference
            };

            await updateDoc(userRef, updatedData);

            // Update local context
            if (setUserData) {
                setUserData({ ...userData, ...updatedData });
            }

            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile.');
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
                <Text style={styles.title}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: userData?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'User') + '&background=random' }}
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
                        editable={false} // Prevent manual email change here without Auth re-auth
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
                <Button
                    title={loading ? "Updating..." : "Update"}
                    onPress={handleUpdate}
                    disabled={loading}
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
