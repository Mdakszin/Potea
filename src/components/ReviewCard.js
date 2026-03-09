import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import StarRating from './StarRating';

export default function ReviewCard({ review }) {
    const { colors } = useTheme();

    // Format date string assuming it's a Firestore Timestamp or a Date object
    const formatDate = (dateValue) => {
        if (!dateValue) return '';
        const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);

        // Simple formatting
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
                    <Image
                        source={{ uri: review.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName || 'User')}&background=4CAF50&color=fff` }}
                        style={styles.avatar}
                    />
                </View>
                <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.text }]}>{review.userName || 'Anonymous'}</Text>
                    <View style={styles.ratingRow}>
                        <StarRating rating={review.rating} size={14} readonly />
                        <Text style={[styles.date, { color: colors.textLight }]}>{formatDate(review.createdAt)}</Text>
                    </View>
                </View>
            </View>

            {review.comment ? (
                <Text style={[styles.comment, { color: colors.textLight }]}>{review.comment}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        marginRight: SPACING.md,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        ...TYPOGRAPHY.h5,
        marginBottom: 2,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    date: {
        ...TYPOGRAPHY.bodySmall,
        fontSize: 12,
    },
    comment: {
        ...TYPOGRAPHY.bodySmall,
        lineHeight: 20,
    },
});
