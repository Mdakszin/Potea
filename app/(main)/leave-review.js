import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Modal, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../src/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '../../src/components/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function LeaveReviewScreen() {
    const { order: orderStr } = useLocalSearchParams();
    const order = orderStr ? JSON.parse(orderStr) : null;
    const { colors, isDark } = useTheme();
    const router = useRouter();

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
            setTimeout(() => { setShowSuccess(false); router.back(); }, 2000);
        }, 1500);
    };

    if (!order) return <Text>Order not found</Text>;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color={colors.text} /></TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Leave a Review</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Image source={{ uri: order.plant?.image || order.items?.[0]?.image }} style={styles.productImage} />
                    <View style={styles.productInfo}>
                        <Text style={[styles.plantName, { color: colors.text }]}>{order.plant?.name || order.items?.[0]?.name}</Text>
                        <Text style={[styles.orderQty, { color: colors.textLight }]}>Qty: {order.qty || order.items?.[0]?.qty}</Text>
                        <View style={styles.statusBadge}><Text style={styles.statusText}>Completed</Text></View>
                        <Text style={[styles.orderPrice, { color: COLORS.primary }]}>${(order.price || order.total).toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.reviewSection}>
                    <Text style={[styles.question, { color: colors.text }]}>How is your order?</Text>
                    <Text style={[styles.instruction, { color: colors.textLight }]}>Please give your rating & also your review.</Text>
                    <View style={styles.starContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                <Ionicons name={star <= rating ? "star" : "star-outline"} size={40} color={star <= rating ? "#FFB800" : colors.border} style={styles.star} />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TextInput style={[styles.input, { color: colors.text }]} placeholder="Write your review here..." placeholderTextColor={COLORS.textLight} multiline value={review} onChangeText={setReview} />
                        <TouchableOpacity style={styles.inputIcon}><Ionicons name="image-outline" size={24} color={COLORS.primary} /></TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Button title="Cancel" variant="outline" style={styles.footerBtn} onPress={() => router.back()} />
                <Button title={isSubmitting ? "Submitting..." : "Submit"} style={styles.footerBtn} onPress={handleSubmit} disabled={rating === 0 || isSubmitting} />
            </View>

            <Modal transparent visible={showSuccess} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalIconCircle}><Ionicons name="checkmark" size={60} color={COLORS.white} /></View>
                        <Text style={[styles.modalTitle, { color: COLORS.primary }]}>Success!</Text>
                        <Text style={[styles.modalSubtitle, { color: colors.text }]}>Your review has been submitted successfully.</Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
    headerTitle: { fontSize: 24, fontWeight: '700' },
    content: { flex: 1, padding: SPACING.lg },
    productCard: { flexDirection: 'row', borderRadius: 24, padding: SPACING.md, borderWidth: 1, marginBottom: 32 },
    productImage: { width: 100, height: 100, borderRadius: 20 },
    productInfo: { flex: 1, marginLeft: SPACING.md },
    plantName: { fontSize: 18, fontWeight: '700' },
    orderQty: { fontSize: 12, marginVertical: 2 },
    statusBadge: { alignSelf: 'flex-start', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#E8F0FE', marginVertical: 4 },
    statusText: { fontSize: 10, fontWeight: '700', color: '#246BFD' },
    orderPrice: { fontSize: 18, fontWeight: '700', marginTop: 4 },
    reviewSection: { alignItems: 'center' },
    question: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
    instruction: { fontSize: 14, marginBottom: 24 },
    starContainer: { flexDirection: 'row', marginBottom: 24 },
    star: { marginHorizontal: 4 },
    inputContainer: { width: '100%', borderRadius: 20, padding: SPACING.md, height: 120, flexDirection: 'row', borderWidth: 1 },
    input: { flex: 1, fontSize: 14, textAlignVertical: 'top' },
    inputIcon: { alignSelf: 'flex-end', padding: 4 },
    footer: { flexDirection: 'row', padding: SPACING.lg, gap: SPACING.md },
    footerBtn: { flex: 1 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    modalContent: { borderRadius: 40, padding: 32, alignItems: 'center' },
    modalIconCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
    modalSubtitle: { fontSize: 16, textAlign: 'center' },
});
