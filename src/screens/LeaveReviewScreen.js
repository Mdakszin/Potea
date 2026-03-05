import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, Image, Modal, ActivityIndicator
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';

export default function LeaveReviewScreen({ route, navigation }) {
    const { order } = route.params;
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('Amazing plant & fast delivery! 🔥🔥🔥');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = () => {
        if (rating === 0) return;
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                navigation.goBack();
            }, 2000);
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Leave a Review</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                {/* Product Summary */}
                <View style={styles.productCard}>
                    <Image source={{ uri: order.plant.image }} style={styles.productImage} />
                    <View style={styles.productInfo}>
                        <Text style={styles.plantName}>{order.plant.name}</Text>
                        <Text style={styles.orderQty}>Qty: {order.qty}</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>Completed</Text>
                        </View>
                        <Text style={styles.orderPrice}>${order.price.toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.reviewSection}>
                    <Text style={styles.question}>How is your order?</Text>
                    <Text style={styles.instruction}>Please give your rating & also your review.</Text>

                    {/* Star Rating */}
                    <View style={styles.starContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Ionicons
                                    name={star <= rating ? "star" : "star-outline"}
                                    size={40}
                                    color={star <= rating ? "#FFB800" : COLORS.border}
                                    style={styles.star}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Review Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Write your review here..."
                            placeholderTextColor={COLORS.textLight}
                            multiline
                            value={review}
                            onChangeText={setReview}
                        />
                        <TouchableOpacity style={styles.inputIcon}>
                            <Ionicons name="image-outline" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Button
                    title="Cancel"
                    variant="outline"
                    style={styles.footerBtn}
                    onPress={() => navigation.goBack()}
                />
                <Button
                    title={isSubmitting ? "Submitting..." : "Submit"}
                    style={styles.footerBtn}
                    onPress={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                />
            </View>

            {/* Success Modal */}
            <Modal transparent visible={showSuccess} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIconCircle}>
                            <Ionicons name="checkmark" size={60} color={COLORS.white} />
                        </View>
                        <Text style={styles.modalTitle}>Success!</Text>
                        <Text style={styles.modalSubtitle}>Your review has been submitted successfully.</Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
    },
    content: {
        flex: 1,
        padding: SPACING.lg,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 24,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.xxl,
    },
    productImage: {
        width: 100,
        height: 100,
        borderRadius: 20,
        backgroundColor: COLORS.card,
    },
    productInfo: {
        flex: 1,
        marginLeft: SPACING.md,
    },
    plantName: {
        ...TYPOGRAPHY.h3,
    },
    orderQty: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textLight,
        marginVertical: 2,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingVertical: 2,
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: '#E8F0FE',
        marginVertical: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#246BFD',
    },
    orderPrice: {
        ...TYPOGRAPHY.h3,
        color: COLORS.primary,
        marginTop: 4,
    },
    reviewSection: {
        alignItems: 'center',
    },
    question: {
        ...TYPOGRAPHY.h2,
        marginBottom: SPACING.xs,
    },
    instruction: {
        ...TYPOGRAPHY.bodySmall,
        color: COLORS.textLight,
        marginBottom: SPACING.xl,
    },
    starContainer: {
        flexDirection: 'row',
        marginBottom: SPACING.xl,
    },
    star: {
        marginHorizontal: 4,
    },
    inputContainer: {
        width: '100%',
        backgroundColor: COLORS.card,
        borderRadius: 20,
        padding: SPACING.md,
        height: 120,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    input: {
        flex: 1,
        ...TYPOGRAPHY.bodySmall,
        textAlignVertical: 'top',
    },
    inputIcon: {
        alignSelf: 'flex-end',
        padding: 4,
    },
    footer: {
        flexDirection: 'row',
        padding: SPACING.lg,
        gap: SPACING.md,
    },
    footerBtn: {
        flex: 1,
        borderRadius: 30,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderRadius: 40,
        padding: SPACING.xl,
        alignItems: 'center',
    },
    modalIconCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.xl,
    },
    modalTitle: {
        ...TYPOGRAPHY.h2,
        color: COLORS.primary,
        marginBottom: SPACING.md,
    },
    modalSubtitle: {
        ...TYPOGRAPHY.body,
        textAlign: 'center',
        paddingHorizontal: SPACING.lg,
    }
});
