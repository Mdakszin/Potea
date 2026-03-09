import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import Button from './Button';
import StarRating from './StarRating';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function WriteReviewModal({ visible, onClose, productId, onReviewAdded }) {
    const { colors } = useTheme();
    const { currentUser, userData } = useAuth();

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }

        if (!currentUser) {
            setError('You must be logged in to leave a review.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const reviewData = {
                productId,
                userId: currentUser.uid,
                userName: userData?.name || currentUser.displayName || 'User',
                userAvatar: userData?.avatar || currentUser.photoURL || '',
                rating,
                comment: comment.trim(),
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'reviews'), reviewData);

            // Success
            setRating(0);
            setComment('');
            onReviewAdded && onReviewAdded();
            onClose();
        } catch (err) {
            console.error('Error submitting review:', err);
            setError('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <Text style={[styles.title, { color: colors.text }]}>Write a Review</Text>

                    {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

                    <View style={styles.ratingSection}>
                        <Text style={[styles.label, { color: colors.text }]}>Your Rating:</Text>
                        <StarRating
                            rating={rating}
                            onRatingChange={setRating}
                            size={32}
                        />
                    </View>

                    <Text style={[styles.label, { color: colors.text }]}>Your Review (Optional):</Text>
                    <TextInput
                        style={[styles.textInput, {
                            backgroundColor: colors.inputBg,
                            color: colors.text,
                            borderColor: colors.border
                        }]}
                        placeholder="What did you think about this plant?"
                        placeholderTextColor={colors.textLight}
                        multiline
                        numberOfLines={4}
                        value={comment}
                        onChangeText={setComment}
                        maxLength={500}
                    />

                    <View style={styles.buttonRow}>
                        <Button
                            title="Cancel"
                            variant="outline"
                            style={styles.cancelBtn}
                            onPress={onClose}
                            disabled={isSubmitting}
                        />
                        <Button
                            title="Submit"
                            style={styles.submitBtn}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            loading={isSubmitting}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: SPACING.xl,
        minHeight: 350,
    },
    title: {
        ...TYPOGRAPHY.h3,
        marginBottom: SPACING.lg,
        textAlign: 'center',
    },
    ratingSection: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    label: {
        ...TYPOGRAPHY.bodyMedium,
        fontWeight: 'bold',
        marginBottom: SPACING.sm,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: SPACING.md,
        minHeight: 120,
        textAlignVertical: 'top',
        ...TYPOGRAPHY.bodyMedium,
        marginBottom: SPACING.xl,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: SPACING.md,
    },
    cancelBtn: {
        flex: 1,
    },
    submitBtn: {
        flex: 1,
    },
    error: {
        ...TYPOGRAPHY.bodySmall,
        textAlign: 'center',
        marginBottom: SPACING.sm,
    },
});
