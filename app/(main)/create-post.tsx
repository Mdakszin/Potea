import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity,
    Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { forumService } from '../../src/services/forumService';
import Button from '../../src/components/Button';

export default function CreatePostScreen() {
    const { colors } = useTheme();
    const { currentUser, userData } = useAuth();
    const router = useRouter();

    const [content, setContent] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.3, // Low quality to fit within Firestore document limits as Base64
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handlePost = async () => {
        if (!content.trim() && !image) {
            Alert.alert('Empty Post', 'Please add some text or an image.');
            return;
        }

        if (!currentUser) return;

        setLoading(true);
        try {
            await forumService.createPost({
                userId: currentUser.uid,
                authorName: userData?.fullName || 'Plant Lover',
                authorAvatar: userData?.avatar || 'https://via.placeholder.com/150',
                content: content.trim(),
                image: image || undefined,
            });
            
            Alert.alert('Post Created', 'Your post is now live in the community forum.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err) {
            console.error('Error creating post:', err);
            Alert.alert('Error', 'Failed to publish post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="close" size={28} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Create Post</Text>
                
                <TouchableOpacity 
                    onPress={handlePost} 
                    disabled={loading || (!content.trim() && !image)}
                    style={[
                        styles.postBtn, 
                        { backgroundColor: (!content.trim() && !image) ? colors.border : COLORS.primary }
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.postBtnText}>Post</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    
                    {/* User Info Row */}
                    <View style={styles.userRow}>
                        <Image 
                            source={{ uri: userData?.avatar || 'https://via.placeholder.com/150' }} 
                            style={styles.avatar} 
                        />
                        <Text style={[styles.userName, { color: colors.text }]}>
                            {userData?.fullName || 'Plant Lover'}
                        </Text>
                    </View>

                    {/* Text Input */}
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Share something with the community..."
                        placeholderTextColor={colors.textLight}
                        multiline
                        autoFocus
                        value={content}
                        onChangeText={setContent}
                    />

                    {/* Image Attachment */}
                    {image && (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: image }} style={styles.previewImage} resizeMode="cover" />
                            <TouchableOpacity 
                                style={styles.removeImageBtn}
                                onPress={() => setImage(null)}
                            >
                                <Ionicons name="close-circle" size={28} color="rgba(0,0,0,0.6)" />
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
                
                {/* Bottom Toolbar */}
                <View style={[styles.toolbar, { borderTopColor: colors.border, backgroundColor: colors.card }]}>
                    <TouchableOpacity style={styles.toolbarIcon} onPress={pickImage}>
                        <Ionicons name="image-outline" size={26} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolbarIcon}>
                        <Ionicons name="camera-outline" size={26} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc'
    },
    backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },
    postBtn: { 
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 
    },
    postBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
    
    scrollContent: { padding: SPACING.lg },
    
    userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
    avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
    userName: { fontSize: 16, fontWeight: '600' },
    
    input: {
        fontSize: 18, minHeight: 120, textAlignVertical: 'top',
    },
    
    imageContainer: {
        marginTop: SPACING.md, position: 'relative',
    },
    previewImage: {
        width: '100%', height: 250, borderRadius: 16,
    },
    removeImageBtn: {
        position: 'absolute', top: 10, right: 10,
        backgroundColor: '#fff', borderRadius: 14,
    },

    toolbar: {
        flexDirection: 'row', alignItems: 'center', 
        paddingHorizontal: SPACING.lg, paddingVertical: 12, borderTopWidth: 1,
    },
    toolbarIcon: { marginRight: 20 }
});
