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
