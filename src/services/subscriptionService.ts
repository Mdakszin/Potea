import { db } from '../config/firebase';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { SubscriptionPlan, SubscriptionTier, UserSubscription } from '../types';

// --- Plans Catalog ---
const PLANS: SubscriptionPlan[] = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        description: 'Get started with the basics',
        color: '#9E9E9E',
        icon: 'leaf-outline',
        features: [
            'Browse & buy plants',
            'My Garden (basic)',
            'Loyalty points',
            'AI Plant Doctor (3/month)',
        ],
    },
    {
        id: 'green_thumb',
        name: 'Green Thumb',
        price: 49,
        description: 'For the dedicated plant parent',
        color: '#4CAF50',
        icon: 'hand-left',
        highlighted: true,
        features: [
            'Everything in Free',
            'Unlimited AI Plant Doctor',
            'Expert Care Guides',
            'Priority Support',
            'Monthly care reminders',
        ],
    },
    {
        id: 'plant_pro',
        name: 'Plant Pro',
        price: 99,
        description: 'The ultimate plant experience',
        color: '#7C4DFF',
        icon: 'diamond',
        features: [
            'Everything in Green Thumb',
            'Advanced Growth Analytics',
            'Exclusive Rare Plants',
            'Free Shipping on all orders',
            '2x Loyalty Points',
            'Early access to new arrivals',
        ],
    },
];

export const subscriptionService = {
    // --- Plans ---

    getPlans: (): SubscriptionPlan[] => {
        return PLANS;
    },

    getPlanById: (planId: SubscriptionTier): SubscriptionPlan | undefined => {
        return PLANS.find(p => p.id === planId);
    },

    // --- User Subscription ---

    getUserSubscription: async (userId: string): Promise<UserSubscription> => {
        const subRef = doc(db, 'subscriptions', userId);
        const snap = await getDoc(subRef);

        if (snap.exists()) {
            return { id: snap.id, ...snap.data() } as UserSubscription;
        }

        // Default to free plan
        const defaultSub: Omit<UserSubscription, 'id'> = {
            userId,
            planId: 'free',
            status: 'active',
            startDate: serverTimestamp(),
        };
        await setDoc(subRef, defaultSub);
        return { id: userId, ...defaultSub, startDate: new Date() } as UserSubscription;
    },

    subscribeToPlan: async (userId: string, planId: SubscriptionTier): Promise<void> => {
        const subRef = doc(db, 'subscriptions', userId);

        await setDoc(subRef, {
            userId,
            planId,
            status: 'active',
            startDate: serverTimestamp(),
            endDate: null,
            cancelledAt: null,
        }, { merge: true });
    },

    cancelSubscription: async (userId: string): Promise<void> => {
        const subRef = doc(db, 'subscriptions', userId);

        await updateDoc(subRef, {
            planId: 'free',
            status: 'cancelled',
            cancelledAt: serverTimestamp(),
        });
    },

    // --- Feature Gating ---

    isPremiumUser: async (userId: string): Promise<boolean> => {
        try {
            const sub = await subscriptionService.getUserSubscription(userId);
            return sub.planId !== 'free' && sub.status === 'active';
        } catch {
            return false;
        }
    },

    hasFeature: async (userId: string, feature: string): Promise<boolean> => {
        try {
            const sub = await subscriptionService.getUserSubscription(userId);
            const plan = PLANS.find(p => p.id === sub.planId);
            if (!plan) return false;

            const featureMap: Record<string, SubscriptionTier[]> = {
                'unlimited_ai_doctor': ['green_thumb', 'plant_pro'],
                'expert_guides': ['green_thumb', 'plant_pro'],
                'priority_support': ['green_thumb', 'plant_pro'],
                'advanced_analytics': ['plant_pro'],
                'exclusive_plants': ['plant_pro'],
                'free_shipping': ['plant_pro'],
                'double_points': ['plant_pro'],
            };

            const allowedPlans = featureMap[feature];
            if (!allowedPlans) return true; // Feature not gated
            return allowedPlans.includes(sub.planId);
        } catch {
            return false;
        }
    },

    // --- Tier helpers ---

    getTierBadge: (planId: SubscriptionTier): { label: string; color: string; icon: string } => {
        const badges: Record<SubscriptionTier, { label: string; color: string; icon: string }> = {
            free: { label: 'Free', color: '#9E9E9E', icon: 'leaf-outline' },
            green_thumb: { label: 'Green Thumb', color: '#4CAF50', icon: 'hand-left' },
            plant_pro: { label: 'Plant Pro', color: '#7C4DFF', icon: 'diamond' },
        };
        return badges[planId];
    },
};
