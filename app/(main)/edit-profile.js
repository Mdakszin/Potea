import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TextField from '../../src/components/TextField';
import Button from '../../src/components/Button';
import { useAuth } from '../../src/contexts/AuthContext';
import { db } from '../../src/config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useRouter } from 'expo-router';

export default function EditProfileScreen() {
    const { currentUser, userData, setUserData } = useAuth();
    const { colors, isDark } = useTheme();
    const router = useRouter();

    const [name, setName] = useState(userData?.name || '');
    const [nickname, setNickname] = useState(userData?.nickname || '');
    const [email, setEmail] = useState(userData?.email || currentUser?.email || '');
    const [phone, setPhone] = useState(userData?.phone || '');
    const [gender, setGender] = useState(userData?.gender || '');
    const [dob, setDob] = useState(userData?.dob || '');
    const [avatarUri, setAvatarUri] = useState(userData?.avatar || currentUser?.photoURL || null);
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    useEffect(() => {
        if (userData) {
            setName(userData.name || '');
            setNickname(userData.nickname || '');
            setEmail(userData.email || '');
            setPhone(userData.phone || '');
            setGender(userData.gender || '');
            setDob(userData.dob || '');
            setAvatarUri(userData.avatar || currentUser?.photoURL || null);
        }
    }, [userData]);

    const handlePickAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission Required', 'Please allow access to your photo library.'); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.8 });
        if (!result.canceled && result.assets.length > 0) await uploadAvatarToStorage(result.assets[0].uri);
    };

    const uploadAvatarToStorage = async (localUri) => {
        try {
            setUploadingAvatar(true);
            const manipulatedImage = await ImageManipulator.manipulateAsync(localUri, [{ resize: { width: 500, height: 500 } }], { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG });
            const base64 = await FileSystem.readAsStringAsync(manipulatedImage.uri, { encoding: FileSystem.EncodingType.Base64 });
            const base64Data = `data:image/jpeg;base64,${base64}`;
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { avatar: base64Data });
            setAvatarUri(base64Data);
            setUserData({ ...userData, avatar: base64Data });
            Alert.alert('Success', 'Profile picture updated!');
        } catch (error) {
            console.error("Avatar upload error:", error);
            Alert.alert('Error', 'Failed to update avatar.');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const updatedData = { name, nickname, email, phone, gender, dob };
            await updateDoc(userRef, updatedData);
            setUserData({ ...userData, ...updatedData });
            Alert.alert('Success', 'Profile updated successfully!');
            router.back();
        } catch (error) {
            console.error("Profile update error:", error);
            Alert.alert('Error', 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarContainer}>
                    <TouchableOpacity onPress={handlePickAvatar} style={styles.avatarWrapper}>
                        {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatar} /> : <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card }]}><Ionicons name="person" size={50} color={colors.textLight} /></View>}
                        <View style={styles.editBadge}><Ionicons name="pencil" size={12} color={COLORS.white} /></View>
                        {uploadingAvatar && <View style={styles.uploadOverlay}><ActivityIndicator color={COLORS.white} /></View>}
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <TextField label="Full Name" value={name} onChangeText={setName} />
                    <TextField label="Nickname" value={nickname} onChangeText={setNickname} />
                    <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
                    <TextField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                    <TextField label="Gender" value={gender} onChangeText={setGender} />
                    <TextField label="Date of Birth" value={dob} onChangeText={setDob} />
                </View>
            </ScrollView>
            <View style={styles.footer}><Button title={loading ? "Saving..." : "Update"} onPress={handleSave} style={{ width: '100%' }} disabled={loading} /></View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
    title: { fontSize: 24, fontWeight: '700' },
    scrollContent: { padding: SPACING.lg },
    avatarContainer: { alignItems: 'center', marginVertical: 24 },
    avatarWrapper: { position: 'relative' },
    avatar: { width: 120, height: 120, borderRadius: 60 },
    avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
    editBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, borderUnits: 'pixel', borderWidth: 2, borderColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
    uploadOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
    form: { gap: 16 },
    footer: { padding: SPACING.lg },
});
