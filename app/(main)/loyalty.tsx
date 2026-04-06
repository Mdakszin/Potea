import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { loyaltyService } from '../../src/services/loyaltyService';
import { LoyaltyProfile, Reward, LoyaltyTier } from '../../src/types';

export default function LoyaltyScreen() {
    const { colors } = useTheme();
    const { currentUser } = useAuth();
    const router = useRouter();

    const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [redeeming, setRedeeming] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!currentUser) return;
        try {
            const [prof, streak] = await Promise.all([
                loyaltyService.getOrCreateProfile(currentUser.uid),
                loyaltyService.checkAndUpdateStreak(currentUser.uid),
            ]);
            setProfile({ ...prof, streak });
            setRewards(loyaltyService.getAvailableRewards());
        } catch (err) {
            console.error('Error loading loyalty data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRedeem = async (reward: Reward) => {
        if (!currentUser || !profile) return;
        if (profile.points < reward.pointsCost) {
            Alert.alert('Not Enough Points', `You need ${reward.pointsCost - profile.points} more points to redeem this reward.`);
            return;
        }
        Alert.alert(
            'Redeem Reward',
            `Spend ${reward.pointsCost} points on "${reward.name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Redeem',
                    onPress: async () => {
                        setRedeeming(reward.id);
                        const success = await loyaltyService.redeemReward(currentUser.uid, reward);
                        if (success) {
                            Alert.alert('🎉 Redeemed!', `You've claimed "${reward.name}". Check your profile for details.`);
                            loadData();
                        } else {
                            Alert.alert('Error', 'Could not redeem reward. Please try again.');
                        }
                        setRedeeming(null);
                    },
                },
            ]
        );
    };

    const tierInfo = profile ? loyaltyService.getTierInfo(profile.tier) : null;
    const progress = profile && tierInfo && tierInfo.nextTier
        ? Math.min(profile.totalEarned / tierInfo.nextMin, 1)
        : 1;

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>My Rewards</Text>
                    <TouchableOpacity onPress={() => router.push('/(main)/points-history')}>
                        <Ionicons name="time-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Points Card */}
                <View style={[styles.pointsCard, { backgroundColor: tierInfo?.color || COLORS.primary }]}>
                    <View style={styles.pointsCardInner}>
                        <Text style={styles.pointsLabel}>Your Points</Text>
                        <Text style={styles.pointsValue}>{profile?.points?.toLocaleString() || '0'}</Text>
                        <View style={styles.tierBadge}>
                            <Text style={styles.tierText}>{tierInfo?.label || '🌱 Seed'}</Text>
                        </View>
                    </View>

                    {/* Streak Info */}
                    <View style={styles.streakRow}>
                        <View style={styles.streakItem}>
                            <Ionicons name="flame" size={20} color="#FFD700" />
                            <Text style={styles.streakText}>{profile?.streak || 0} day streak</Text>
                        </View>
                        <View style={styles.streakItem}>
                            <Ionicons name="trending-up" size={20} color="#FFD700" />
                            <Text style={styles.streakText}>{profile?.totalEarned?.toLocaleString() || '0'} lifetime</Text>
                        </View>
                    </View>
                </View>

                {/* Tier Progress */}
                {tierInfo?.nextTier && (
                    <View style={[styles.progressSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.progressHeader}>
                            <Text style={[styles.progressTitle, { color: colors.text }]}>
                                Next Tier: {loyaltyService.getTierInfo(tierInfo.nextTier).label}
                            </Text>
                            <Text style={[styles.progressPoints, { color: colors.textLight }]}>
                                {profile?.totalEarned || 0} / {tierInfo.nextMin}
                            </Text>
                        </View>
                        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${Math.round(progress * 100)}%`,
                                        backgroundColor: tierInfo.color,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                )}

                {/* How to Earn */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>How to Earn Points</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.earnScroll}>
                    {[
                        { icon: 'cart', label: 'Purchase', pts: '10/R1', color: '#4CAF50' },
                        { icon: 'water', label: 'Care Log', pts: '+5 pts', color: '#2196F3' },
                        { icon: 'leaf', label: 'Add Plant', pts: '+15 pts', color: '#8BC34A' },
                        { icon: 'flame', label: '7-Day Streak', pts: '+50 pts', color: '#FF9800' },
                        { icon: 'star', label: 'Review', pts: '+20 pts', color: '#9C27B0' },
                    ].map((item, i) => (
                        <View key={i} style={[styles.earnCard, { backgroundColor: item.color + '15', borderColor: item.color + '40' }]}>
                            <View style={[styles.earnIconBg, { backgroundColor: item.color }]}>
                                <Ionicons name={item.icon as any} size={20} color="#fff" />
                            </View>
                            <Text style={[styles.earnLabel, { color: colors.text }]}>{item.label}</Text>
                            <Text style={[styles.earnPts, { color: item.color }]}>{item.pts}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Rewards Catalog */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Redeem Rewards</Text>
                </View>

                {rewards.map((reward) => {
                    const canAfford = (profile?.points || 0) >= reward.pointsCost;
                    return (
                        <TouchableOpacity
                            key={reward.id}
                            style={[styles.rewardCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => handleRedeem(reward)}
                            disabled={redeeming === reward.id}
                        >
                            <View style={[styles.rewardIcon, { backgroundColor: canAfford ? COLORS.primary + '15' : colors.border }]}>
                                <Ionicons
                                    name={reward.icon as any}
                                    size={24}
                                    color={canAfford ? COLORS.primary : colors.textLight}
                                />
                            </View>
                            <View style={styles.rewardInfo}>
                                <Text style={[styles.rewardName, { color: colors.text }]}>{reward.name}</Text>
                                <Text style={[styles.rewardDesc, { color: colors.textLight }]}>{reward.description}</Text>
                            </View>
                            <View style={styles.rewardCost}>
                                {redeeming === reward.id ? (
                                    <ActivityIndicator size="small" color={COLORS.primary} />
                                ) : (
                                    <>
                                        <Text style={[styles.rewardPts, { color: canAfford ? COLORS.primary : colors.textLight }]}>
                                            {reward.pointsCost}
                                        </Text>
                                        <Text style={[styles.rewardPtsLabel, { color: colors.textLight }]}>pts</Text>
                                    </>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
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

    // Points Card
    pointsCard: {
        marginHorizontal: SPACING.lg, borderRadius: 24, padding: SPACING.lg,
        marginBottom: SPACING.lg, overflow: 'hidden',
    },
    pointsCardInner: { alignItems: 'center', marginBottom: SPACING.md },
    pointsLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500', marginBottom: 4 },
    pointsValue: { fontSize: 48, fontWeight: '800', color: '#fff', letterSpacing: 1 },
    tierBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 16,
        paddingVertical: 6, borderRadius: 20, marginTop: 8,
    },
    tierText: { fontSize: 14, fontWeight: '700', color: '#fff' },
    streakRow: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
    streakItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    streakText: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

    // Progress
    progressSection: {
        marginHorizontal: SPACING.lg, borderRadius: 16, padding: SPACING.md,
        borderWidth: 1, marginBottom: SPACING.lg,
    },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressTitle: { fontSize: 14, fontWeight: '600' },
    progressPoints: { fontSize: 13 },
    progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },

    // Earn Section
    sectionHeader: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.sm },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    earnScroll: { paddingLeft: SPACING.lg, marginBottom: SPACING.lg },
    earnCard: {
        width: 100, alignItems: 'center', paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm, borderRadius: 16, marginRight: SPACING.sm,
        borderWidth: 1,
    },
    earnIconBg: {
        width: 40, height: 40, borderRadius: 20, alignItems: 'center',
        justifyContent: 'center', marginBottom: 8,
    },
    earnLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4, textAlign: 'center' },
    earnPts: { fontSize: 11, fontWeight: '800' },

    // Rewards
    rewardCard: {
        flexDirection: 'row', alignItems: 'center', marginHorizontal: SPACING.lg,
        padding: SPACING.md, borderRadius: 16, borderWidth: 1, marginBottom: SPACING.sm,
    },
    rewardIcon: {
        width: 48, height: 48, borderRadius: 14, alignItems: 'center',
        justifyContent: 'center', marginRight: SPACING.md,
    },
    rewardInfo: { flex: 1 },
    rewardName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    rewardDesc: { fontSize: 12 },
    rewardCost: { alignItems: 'center', marginLeft: SPACING.sm },
    rewardPts: { fontSize: 18, fontWeight: '800' },
    rewardPtsLabel: { fontSize: 11 },
});
