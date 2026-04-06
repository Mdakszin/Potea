export interface Plant {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviews: number;
    image: string;
    category: string;
    isFavorite?: boolean;
    sizes?: string[];
    care?: {
        light: string;
        water: string;
        hummidity: string;
        fertilizer: string;
    };
}

export interface CartItem extends Plant {
    qty: number;
    size: string;
    createdAt: Date | any;
}

export interface Review {
    id?: string;
    productId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    rating: number;
    comment: string;
    createdAt: Date | any;
}

export interface Category {
    id: string;
    label: string;
}

export interface Notification {
    id: string;
    type: 'order' | 'promo' | 'system';
    icon: string;
    title: string;
    message: string;
    time: string;
    isRead: boolean;
}

export interface Transaction {
    id: string;
    name: string;
    date: string;
    amount: number;
    type: string;
    icon: string | null;
    isTopUp: boolean;
}

export type OrderStatus = 'placed' | 'processing' | 'shipping' | 'delivered' | 'completed' | 'cancelled';

export interface OrderItem {
    id: string;
    name: string;
    image: string;
    qty: number;
    price: number;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    shippingMethod: string;
    createdAt: any; // Firestore Timestamp
    updatedAt?: any;
}

export interface UserPlant {
    id: string;
    userId: string;
    plantId?: string; // Reference to original plant from shop
    nickname: string;
    image: string;
    location: string;
    healthStatus: 'healthy' | 'needs-attention' | 'sick' | 'dormant';
    dateAdded: any; // Firestore Timestamp
    careSchedule: {
        watering: number; // days
        fertilizing: number; // days
        repotting: number; // days (optional)
    };
    lastCare: {
        watering?: any;
        fertilizing?: any;
        repotting?: any;
    };
}

export interface CareLog {
    id: string;
    userPlantId: string;
    type: 'watering' | 'fertilizing' | 'repotting' | 'pruning' | 'pest-control';
    date: any;
    notes?: string;
}

export interface GrowthUpdate {
    id: string;
    userPlantId: string;
    image: string;
    date: any;
    notes?: string;
}

// -- Loyalty & Rewards --

export type LoyaltyTier = 'seed' | 'sprout' | 'bloom' | 'evergreen';

export interface LoyaltyProfile {
    id: string;
    userId: string;
    points: number;
    totalEarned: number;
    tier: LoyaltyTier;
    streak: number; // consecutive login days
    lastLoginDate?: any;
    joinedAt: any;
}

export interface PointTransaction {
    id: string;
    userId: string;
    amount: number; // positive = earned, negative = redeemed
    type: 'purchase' | 'care' | 'garden' | 'review' | 'streak' | 'redeem' | 'bonus';
    reason: string;
    createdAt: any;
}

export interface Reward {
    id: string;
    name: string;
    description: string;
    pointsCost: number;
    icon: string;
    category: 'discount' | 'shipping' | 'exclusive' | 'gift';
    isActive: boolean;
}

// -- Subscriptions --

export type SubscriptionTier = 'free' | 'green_thumb' | 'plant_pro';

export interface SubscriptionPlan {
    id: SubscriptionTier;
    name: string;
    price: number; // monthly in ZAR
    description: string;
    color: string;
    icon: string;
    features: string[];
    highlighted?: boolean;
}

export interface UserSubscription {
    id: string;
    userId: string;
    planId: SubscriptionTier;
    status: 'active' | 'cancelled' | 'expired';
    startDate: any;
    endDate?: any;
    cancelledAt?: any;
}

// -- Forum --

export interface ForumPost {
    id: string;
    userId: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    image?: string;
    likes: string[]; // array of userIds
    commentsCount: number;
    createdAt: any;
}

export interface ForumComment {
    id: string;
    postId: string;
    userId: string;
    authorName: string;
    authorAvatar: string;
    content: string;
    createdAt: any;
}
