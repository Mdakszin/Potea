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
