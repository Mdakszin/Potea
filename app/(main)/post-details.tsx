import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Image, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { forumService } from '../../src/services/forumService';
import { ForumPost, ForumComment } from '../../src/types';

export default function PostDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const { currentUser, userData } = useAuth();
    const router = useRouter();

    const [post, setPost] = useState<ForumPost | null>(null);
    const [comments, setComments] = useState<ForumComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (id) {
            loadPostAndComments();
        }
    }, [id]);

    const loadPostAndComments = async () => {
        try {
            const [postData, commentsData] = await Promise.all([
                forumService.getPostById(id as string),
                forumService.getComments(id as string)
            ]);
            setPost(postData);
            setComments(commentsData);
        } catch (err) {
            console.error('Error loading post details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendComment = async () => {
        if (!newComment.trim() || !currentUser || !post) return;
        
        setPosting(true);
        try {
            await forumService.addComment({
                postId: post.id,
                userId: currentUser.uid,
                authorName: userData?.fullName || 'Plant Lover',
                authorAvatar: userData?.avatar || 'https://via.placeholder.com/40',
                content: newComment.trim(),
            });
            
            setNewComment('');
            // Reload comments
            const refreshComments = await forumService.getComments(id as string);
            setComments(refreshComments);
            // Quick update post comment count locally
            setPost({ ...post, commentsCount: post.commentsCount + 1 });
            
        } catch (err) {
            console.error('Error adding comment:', err);
        } finally {
            setPosting(false);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Post</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!post) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Text style={{ textAlign: 'center', marginTop: 40, color: colors.text }}>Post not found.</Text>
            </SafeAreaView>
        );
    }

    const renderHeader = () => (
        <View style={[styles.postHeader, { borderBottomColor: colors.border }]}>
            <View style={styles.authorRow}>
                <Image source={{ uri: post.authorAvatar }} style={styles.avatarMain} />
                <View style={styles.authorDetails}>
                    <Text style={[styles.authorNameMain, { color: colors.text }]}>{post.authorName}</Text>
                    <Text style={[styles.postTime, { color: colors.textLight }]}>{formatDate(post.createdAt)}</Text>
                </View>
            </View>
            <Text style={[styles.postContentMain, { color: colors.text }]}>{post.content}</Text>
            {post.image && (
                <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
            )}
            <View style={styles.statsRow}>
                <Text style={[styles.statsText, { color: colors.textLight }]}>
                    {post.likes.length} Likes • {post.commentsCount} Comments
                </Text>
            </View>
        </View>
    );

    const renderComment = ({ item }: { item: ForumComment }) => (
        <View style={styles.commentRow}>
            <Image source={{ uri: item.authorAvatar }} style={styles.commentAvatar} />
            <View style={[styles.commentBubble, { backgroundColor: colors.card }]}>
                <View style={styles.commentHeader}>
                    <Text style={[styles.commentAuthor, { color: colors.text }]}>{item.authorName}</Text>
                    <Text style={[styles.commentTime, { color: colors.textLight }]}>{formatDate(item.createdAt)}</Text>
                </View>
                <Text style={[styles.commentContent, { color: colors.text }]}>{item.content}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* Header Navbar */}
                <View style={[styles.header, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Thread</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Content */}
                <FlatList
                    data={comments}
                    keyExtractor={item => item.id}
                    ListHeaderComponent={renderHeader}
                    renderItem={renderComment}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={{ color: colors.textLight }}>No comments yet. Start the conversation!</Text>
                        </View>
                    }
                />

                {/* Input Bar */}
                <View style={[styles.inputContainer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                        placeholder="Add a comment..."
                        placeholderTextColor={colors.textLight}
                        value={newComment}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <TouchableOpacity 
                        style={[styles.sendBtn, { backgroundColor: newComment.trim() ? COLORS.primary : colors.border }]}
                        onPress={handleSendComment}
                        disabled={!newComment.trim() || posting}
                    >
                        {posting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={18} color="#fff" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    },
    backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700' },

    listContent: { paddingBottom: SPACING.xl },

    postHeader: { padding: SPACING.lg, borderBottomWidth: 1 },
    authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    avatarMain: { width: 48, height: 48, borderRadius: 24, marginRight: SPACING.md },
    authorDetails: { flex: 1 },
    authorNameMain: { fontSize: 17, fontWeight: '700' },
    postTime: { fontSize: 13, marginTop: 2 },
    
    postContentMain: { fontSize: 16, lineHeight: 24, marginTop: 8 },
    postImage: { width: '100%', height: 280, borderRadius: 16, marginTop: SPACING.md },
    
    statsRow: { marginTop: SPACING.md, paddingTop: SPACING.sm },
    statsText: { fontSize: 14, fontWeight: '500' },

    commentRow: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginTop: SPACING.md },
    commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
    commentBubble: { flex: 1, padding: 12, borderRadius: 16, borderTopLeftRadius: 4 },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    commentAuthor: { fontSize: 14, fontWeight: '700' },
    commentTime: { fontSize: 11 },
    commentContent: { fontSize: 14, lineHeight: 20 },

    inputContainer: { 
        flexDirection: 'row', padding: SPACING.md, borderTopWidth: 1, alignItems: 'flex-end'
    },
    input: { 
        flex: 1, minHeight: 44, maxHeight: 100, borderRadius: 22, 
        paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, fontSize: 15,
        marginRight: 10
    },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22,
        alignItems: 'center', justifyContent: 'center'
    }
});
