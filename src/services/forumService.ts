import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    query,
    orderBy,
    getDocs,
    getDoc,
    serverTimestamp,
    increment,
    where,
    limit,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';
import { ForumPost, ForumComment } from '../types';

export const forumService = {
    // --- Posts ---

    getPosts: async (maxResults = 50): Promise<ForumPost[]> => {
        const q = query(
            collection(db, 'forumPosts'),
            orderBy('createdAt', 'desc'),
            limit(maxResults)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ForumPost));
    },

    getPostById: async (postId: string): Promise<ForumPost | null> => {
        const docRef = doc(db, 'forumPosts', postId);
        const snap = await getDoc(docRef);
        if (!snap.exists()) return null;
        return { id: snap.id, ...snap.data() } as ForumPost;
    },

    createPost: async (post: Omit<ForumPost, 'id' | 'likes' | 'commentsCount' | 'createdAt'>): Promise<string> => {
        const docRef = await addDoc(collection(db, 'forumPosts'), {
            ...post,
            likes: [],
            commentsCount: 0,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    },

    toggleLike: async (postId: string, userId: string, isCurrentlyLiked: boolean): Promise<void> => {
        const postRef = doc(db, 'forumPosts', postId);
        await updateDoc(postRef, {
            likes: isCurrentlyLiked ? arrayRemove(userId) : arrayUnion(userId)
        });
    },

    // --- Comments ---

    getComments: async (postId: string): Promise<ForumComment[]> => {
        const q = query(
            collection(db, 'forumComments'),
            where('postId', '==', postId),
            orderBy('createdAt', 'asc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ForumComment));
    },

    addComment: async (comment: Omit<ForumComment, 'id' | 'createdAt'>): Promise<string> => {
        // 1. Add the comment
        const commentRef = await addDoc(collection(db, 'forumComments'), {
            ...comment,
            createdAt: serverTimestamp(),
        });

        // 2. Increment the post's comment count
        const postRef = doc(db, 'forumPosts', comment.postId);
        await updateDoc(postRef, {
            commentsCount: increment(1)
        });

        return commentRef.id;
    }
};
