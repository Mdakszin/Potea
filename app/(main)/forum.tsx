import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, Image, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { forumService } from '../../src/services/forumService';
import { ForumPost } from '../../src/types';

export default function ForumScreen() {
    const { colors } = useTheme();
    const { currentUser } = useAuth();
    const router = useRouter();

    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const data = await forumService.getPosts();
            setPosts(data);
        } catch (err) {
            console.error('Error loading forum posts:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadPosts();
    };

    const handleLike = async (post: ForumPost) => {
        if (!currentUser) return;
        const isLiked = post.likes.includes(currentUser.uid);
        
        // Optimistic update
        setPosts(current => current.map(p => {
            if (p.id === post.id) {
                return {
                    ...p,
                    likes: isLiked 
                        ? p.likes.filter(id => id !== currentUser.uid) 
                        : [...p.likes, currentUser.uid]
                };
            }
            return p;
        }));

        try {
            await forumService.toggleLike(post.id, currentUser.uid, isLiked);
        } catch (err) {
            console.error('Error toggling like:', err);
            // Revert optimism on error
            loadPosts();
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
        
        if (diffDays === 0) {
            // Check hours
            const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600));
            if (diffHours === 0) {
                const diffMins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
                return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
            }
            return `${diffHours}h ago`;
        }
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const renderPost = ({ item }: { item: ForumPost }) => {
        const isLiked = currentUser && item.likes.includes(currentUser.uid);

        return (
            <TouchableOpacity 
                style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push({ pathname: '/(main)/post-details', params: { id: item.id } })}
                activeOpacity={0.9}
            >
                {/* Author Info */}
                <View style={styles.authorRow}>
                    <Image source={{ uri: item.authorAvatar || 'https://via.placeholder.com/40' }} style={styles.avatar} />
                    <View style={styles.authorDetails}>
                        <Text style={[styles.authorName, { color: colors.text }]}>{item.authorName}</Text>
                        <Text style={[styles.postTime, { color: colors.textLight }]}>{formatDate(item.createdAt)}</Text>
                    </View>
                </View>

                {/* Content */}
                <Text style={[styles.postContent, { color: colors.text }]}>{item.content}</Text>

                {/* Optional Image */}
                {item.image && (
                    <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />
                )}

                {/* Action Bar */}
                <View style={[styles.actionBar, { borderTopColor: colors.border }]}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item)}>
                        <Ionicons 
                            name={isLiked ? "heart" : "heart-outline"} 
                            size={22} 
                            color={isLiked ? COLORS.error : colors.textLight} 
                        />
                        <Text style={[styles.actionText, { color: isLiked ? COLORS.error : colors.textLight }]}>
                            {item.likes.length > 0 ? item.likes.length : 'Like'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => router.push({ pathname: '/(main)/post-details', params: { id: item.id } })}
                    >
                        <Ionicons name="chatbubble-outline" size={20} color={colors.textLight} />
                        <Text style={[styles.actionText, { color: colors.textLight }]}>
                            {item.commentsCount > 0 ? item.commentsCount : 'Comment'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Community Forum</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Post Feed */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={item => item.id}
                    renderItem={renderPost}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="chatbubbles-outline" size={64} color={colors.border} />
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>No posts yet</Text>
                            <Text style={[styles.emptySub, { color: colors.textLight }]}>
                                Be the first to start a conversation!
                            </Text>
                        </View>
                    }
                />
            )}

            {/* Floating Action Button */}
            <TouchableOpacity 
                style={styles.fab}
                onPress={() => router.push('/(main)/create-post')}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
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
    headerTitle: { fontSize: 20, fontWeight: '700' },

    listContainer: { paddingBottom: 100, paddingHorizontal: SPACING.lg },
    
    postCard: {
        borderRadius: 20, padding: SPACING.md,
        borderWidth: 1, marginBottom: SPACING.md,
    },
    authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
    avatar: { width: 40, height: 40, borderRadius: 20, marginRight: SPACING.sm },
    authorDetails: { flex: 1 },
    authorName: { fontSize: 16, fontWeight: '600' },
    postTime: { fontSize: 12, marginTop: 2 },
    
    postContent: { fontSize: 15, lineHeight: 22, paddingBottom: SPACING.sm },
    postImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: SPACING.sm },
    
    actionBar: { 
        flexDirection: 'row', alignItems: 'center', 
        borderTopWidth: 1, paddingTop: SPACING.sm, marginTop: 4 
    },
    actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: SPACING.lg },
    actionText: { fontSize: 14, fontWeight: '500', marginLeft: 6 },

    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
    emptySub: { fontSize: 14, textAlign: 'center' },

    fab: {
        position: 'absolute', bottom: 30, right: 24,
        width: 60, height: 60, borderRadius: 30,
        backgroundColor: COLORS.primary,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 4, elevation: 8,
    }
});
