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
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export default function EditProfileScreen({ navigation }) {
    const { currentUser, userData, setUserData } = useAuth();

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
        // Request permission
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow access to your photo library to change your avatar.');
                return;
            }
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            // Fix: Use ImagePicker.MediaType.Images instead of MediaTypeOptions (deprecated)
            mediaTypes: ImagePicker.MediaType.IMAGES,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets.length > 0) {
            const pickedUri = result.assets[0].uri;
            await processAvatar(pickedUri);
        }
    };

    const processAvatar = async (localUri) => {
        if (!currentUser) return;

        try {
            setUploadingAvatar(true);

            // Resize image to ensure Base64 string stays under Firestore 1MB limit
            // A 400x400 image is sufficient for a profile picture
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                localUri,
                [{ resize: { width: 400, height: 400 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );

            const resizeUri = manipulatedImage.uri;

            let base64Data;
            if (Platform.OS === 'web') {
                const response = await fetch(resizeUri);
                const blob = await response.blob();
                base64Data = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } else {
                const base64 = await FileSystem.readAsStringAsync(resizeUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                base64Data = `data:image/jpeg;base64,${base64}`;
            }

            // Save Base64 directly to Firestore (Fallback for when Storage is unavailable)
            const userRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userRef, { avatar: base64Data });

            // Update local state and context
            setAvatarUri(base64Data);
            if (setUserData) {
                setUserData({ ...userData, avatar: base64Data });
            }

            Alert.alert('Success', 'Profile photo updated!');
        } catch (error) {
            console.error('Avatar processing failed:', error);
            // Check if it's a Firestore size limit error
            if (error.message?.includes('payload size exceeds')) {
                Alert.alert('Error', 'The photo is too large. Please try a different or smaller image.');
            } else {
                Alert.alert('Update Failed', 'Could not save your photo. Please try again.');
            }
        } finally {
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
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=4CAF50&color=fff&size=200`;

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
                    <TouchableOpacity style={styles.avatarWrapper} onPress={handlePickAvatar} disabled={uploadingAvatar}>
                        <Image source={{ uri: resolvedAvatar }} style={styles.avatar} />
                        <View style={styles.editBadge}>
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

            <View style={styles.footer}>
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
    avatarHint: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textLight,
        marginTop: SPACING.sm,
    },
    form: { gap: SPACING.md },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.xl,
        backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border,
    },
});
