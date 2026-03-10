import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert, Platform
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import TextField from '../components/TextField';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '../contexts/ThemeContext';

export default function EditProfileScreen({ navigation }) {
    const { currentUser, userData, setUserData } = useAuth();
    const { colors, isDark } = useTheme();

    const [name, setName] = useState(userData?.name || '');
    const [nickname, setNickname] = useState(userData?.nickname || '');
    const [email, setEmail] = useState(userData?.email || currentUser?.email || '');
    const [phone, setPhone] = useState(userData?.phone || '');
    const [gender, setGender] = useState(userData?.gender || '');
    const [dob, setDob] = useState(userData?.dob || '');
    const [avatarUri, setAvatarUri] = useState(
        userData?.avatar || currentUser?.photoURL || null
    );
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
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow access to your photo library to change your avatar.');
                return;
            }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            const pickedUri = result.assets[0].uri;
            await uploadAvatarToStorage(pickedUri);
        }
    };

    const uploadAvatarToStorage = async (localUri) => {
        if (!currentUser) return;

        try {
            setUploadingAvatar(true);

            const manipulatedImage = await ImageManipulator.manipulateAsync(
                localUri,
                [{ resize: { width: 500, height: 500 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );

            const resizeUri = manipulatedImage.uri;

            let base64Data;
            if (Platform.OS === 'web') {
                const response = await fetch(resizeUri);
                const blob = await response.blob();
                base64Data = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } else {
                const base64 = await FileSystem.readAsStringAsync(resizeUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                base64Data = `data:image/jpeg;base64,${base64}`;
            }

            const storageRef = ref(storage, `avatars/${currentUser.uid}.jpg`);
            await uploadString(storageRef, base64Data, 'data_url');

            const downloadURL = await getDownloadURL(storageRef);

            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { avatar: downloadURL });

            setAvatarUri(downloadURL);
            if (setUserData) {
                setUserData({ ...userData, avatar: downloadURL });
            }

            setUploadingAvatar(false);
            Alert.alert('Success', 'Profile photo updated!');

        } catch (error) {
            console.error('Avatar processing failed:', error);
            Alert.alert('Update Failed', 'Could not process your photo. Please try again.');
            setUploadingAvatar(false);
        }
    };

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
            };

            await updateDoc(userRef, updatedData);

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

    const resolvedAvatar = avatarUri
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=${isDark ? '1F222A' : '4CAF50'}&color=fff&size=200`;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                    <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickAvatar} disabled={uploadingAvatar}>
                        <Image source={{ uri: resolvedAvatar }} style={styles.avatar} />
                        <View style={[styles.editBadge, { borderColor: colors.background }]}>
                            {uploadingAvatar
                                ? <ActivityIndicator size="small" color={COLORS.white} />
                                : <Ionicons name="camera" size={16} color={COLORS.white} />
                            }
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarHint}>Tap to change photo</Text>
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
                        editable={false}
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

            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                <Button
                    title={loading ? "Updating..." : "Update"}
                    onPress={handleUpdate}
                    disabled={loading || uploadingAvatar}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
        alignItems: 'center', justifyContent: 'center', borderWidth: 3,
    },
    avatarHint: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textLight,
        marginTop: SPACING.sm,
    },
    form: { gap: SPACING.md },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl,
        borderTopWidth: 1,
    },
});
