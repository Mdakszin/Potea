import { db } from '../config/firebase';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    query,
    where,
    getDocs,
    getDoc,
    setDoc,
    orderBy,
    limit,
    serverTimestamp,
    increment,
    Timestamp
} from 'firebase/firestore';
import { LoyaltyProfile, LoyaltyTier, PointTransaction, Reward } from '../types';

// --- Tier thresholds ---
const TIER_THRESHOLDS: { tier: LoyaltyTier; min: number }[] = [
    { tier: 'evergreen', min: 5000 },
    { tier: 'bloom', min: 2000 },
    { tier: 'sprout', min: 500 },
    { tier: 'seed', min: 0 },
];

function computeTier(totalEarned: number): LoyaltyTier {
    for (const t of TIER_THRESHOLDS) {
        if (totalEarned >= t.min) return t.tier;
    }
    return 'seed';
}

// --- Default rewards catalog (seeded client-side for now) ---
const DEFAULT_REWARDS: Omit<Reward, 'id'>[] = [
    {
        name: '10% Off Next Order',
        description: 'Get 10% off your next plant purchase',
        pointsCost: 200,
        icon: 'pricetag',
        category: 'discount',
        isActive: true,
    },
    {
        name: 'Free Standard Shipping',
        description: 'Free shipping on your next order',
        pointsCost: 500,
        icon: 'car',
        category: 'shipping',
        isActive: true,
    },
    {
        name: '25% Off Any Plant',
        description: 'A generous discount on any single plant',
        pointsCost: 1000,
        icon: 'star',
        category: 'discount',
        isActive: true,
    },
    {
        name: 'Exclusive Rare Plant Access',
        description: 'Early access to limited-edition rare plants',
        pointsCost: 2500,
        icon: 'diamond',
        category: 'exclusive',
        isActive: true,
    },
    {
        name: 'Mystery Plant Gift Box',
        description: 'A surprise curated box of premium plants',
        pointsCost: 5000,
        icon: 'gift',
        category: 'gift',
        isActive: true,
    },
];

export const loyaltyService = {
    // --- Profile ---

    getOrCreateProfile: async (userId: string): Promise<LoyaltyProfile> => {
        const profileRef = doc(db, 'loyaltyProfiles', userId);
        const snap = await getDoc(profileRef);

        if (snap.exists()) {
            return { id: snap.id, ...snap.data() } as LoyaltyProfile;
        }

        // Create new profile
        const newProfile = {
            userId,
            points: 0,
            totalEarned: 0,
            tier: 'seed' as LoyaltyTier,
            streak: 0,
            joinedAt: serverTimestamp(),
        };
        await setDoc(profileRef, newProfile);
        return { id: userId, ...newProfile, joinedAt: new Date() } as LoyaltyProfile;
    },

    // --- Points ---

    addPoints: async (
        userId: string,
        amount: number,
        type: PointTransaction['type'],
        reason: string
    ): Promise<void> => {
        // 1. Log the transaction
        await addDoc(collection(db, 'pointTransactions'), {
            userId,
            amount,
            type,
            reason,
            createdAt: serverTimestamp(),
        });

        // 2. Update the profile balance
        const profileRef = doc(db, 'loyaltyProfiles', userId);
        await updateDoc(profileRef, {
            points: increment(amount),
            totalEarned: increment(amount),
        });

        // 3. Check tier
        const snap = await getDoc(profileRef);
        if (snap.exists()) {
            const data = snap.data();
            const newTier = computeTier(data.totalEarned);
            if (newTier !== data.tier) {
                await updateDoc(profileRef, { tier: newTier });
            }
        }
    },

    redeemReward: async (userId: string, reward: Reward): Promise<boolean> => {
        const profileRef = doc(db, 'loyaltyProfiles', userId);
        const snap = await getDoc(profileRef);

        if (!snap.exists()) return false;

        const profile = snap.data();
        if (profile.points < reward.pointsCost) return false;

        // 1. Deduct points
        await updateDoc(profileRef, {
            points: increment(-reward.pointsCost),
        });

        // 2. Log as redemption transaction
        await addDoc(collection(db, 'pointTransactions'), {
            userId,
            amount: -reward.pointsCost,
            type: 'redeem',
            reason: `Redeemed: ${reward.name}`,
            createdAt: serverTimestamp(),
        });

        return true;
    },

    // --- History ---

    getPointHistory: async (userId: string, maxResults = 50): Promise<PointTransaction[]> => {
        const q = query(
            collection(db, 'pointTransactions'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(maxResults)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PointTransaction));
    },

    // --- Rewards Catalog ---

    getAvailableRewards: (): Reward[] => {
        // Using client-side rewards for simplicity.
        // In production, these would come from Firestore.
        return DEFAULT_REWARDS.map((r, i) => ({ ...r, id: `reward_${i}` }));
    },

    // --- Streak ---

    checkAndUpdateStreak: async (userId: string): Promise<number> => {
        const profileRef = doc(db, 'loyaltyProfiles', userId);
        const snap = await getDoc(profileRef);

        if (!snap.exists()) return 0;

        const profile = snap.data();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        let lastLogin = 0;
        if (profile.lastLoginDate) {
            const d = profile.lastLoginDate.toDate ? profile.lastLoginDate.toDate() : new Date(profile.lastLoginDate);
            lastLogin = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        }

        const oneDayMs = 86400000;

        if (lastLogin === today) {
            // Already logged in today
            return profile.streak || 0;
        }

        let newStreak = 1;
        if (today - lastLogin === oneDayMs) {
            // Consecutive day
            newStreak = (profile.streak || 0) + 1;
        }

        await updateDoc(profileRef, {
            streak: newStreak,
            lastLoginDate: serverTimestamp(),
        });

        // Award streak bonus every 7 days
        if (newStreak > 0 && newStreak % 7 === 0) {
            await loyaltyService.addPoints(userId, 50, 'streak', `${newStreak}-day login streak bonus!`);
        }

        return newStreak;
    },

    // --- Tier info ---

    getTierInfo: (tier: LoyaltyTier) => {
        const tiers: Record<LoyaltyTier, { label: string; color: string; nextTier: LoyaltyTier | null; nextMin: number }> = {
            seed: { label: '🌱 Seed', color: '#8D6E63', nextTier: 'sprout', nextMin: 500 },
            sprout: { label: '🌿 Sprout', color: '#66BB6A', nextTier: 'bloom', nextMin: 2000 },
            bloom: { label: '🌸 Bloom', color: '#AB47BC', nextTier: 'evergreen', nextMin: 5000 },
            evergreen: { label: '🌳 Evergreen', color: '#FFD700', nextTier: null, nextMin: Infinity },
        };
        return tiers[tier];
    },
};
