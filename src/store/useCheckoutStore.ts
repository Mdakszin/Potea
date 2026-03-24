import { create } from 'zustand';

export interface ShippingMethod {
    id: string;
    type: string;
    icon: string;
    price: number;
    days: string;
    arrival: string;
}

export interface PaymentMethod {
    id: string;
    label: string;
    method: 'wallet' | 'card' | 'paypal' | 'google-pay' | 'google' | 'apple';
    icon: string;
}

export interface PromoCode {
    code: string;
    value: number;
    type: 'percentage' | 'fixed';
}

interface CheckoutState {
    selectedAddress: any | null;
    selectedShipping: ShippingMethod;
    selectedPayment: PaymentMethod;
    appliedPromo: PromoCode | null;
    checkoutCart: any[];

    setSelectedAddress: (address: any) => void;
    setSelectedShipping: (shipping: ShippingMethod) => void;
    setSelectedPayment: (payment: PaymentMethod) => void;
    setAppliedPromo: (promo: PromoCode | null) => void;
    setCheckoutCart: (cart: any[]) => void;
    resetCheckout: () => void;
}

const useCheckoutStore = create<CheckoutState>((set) => ({
    selectedAddress: null,
    selectedShipping: { id: '2', type: 'Regular', icon: 'bicycle-outline', price: 2.99, days: '3-5 days', arrival: 'Mar 10 – 12' },
    selectedPayment: { id: 'wallet', label: 'Potea E-Wallet', method: 'wallet', icon: 'wallet-outline' },
    appliedPromo: null,
    checkoutCart: [],

    setSelectedAddress: (address) => set({ selectedAddress: address }),
    setSelectedShipping: (shipping) => set({ selectedShipping: shipping }),
    setSelectedPayment: (payment) => set({ selectedPayment: payment }),
    setAppliedPromo: (promo) => set({ appliedPromo: promo }),
    setCheckoutCart: (cart) => set({ checkoutCart: cart }),
    
    resetCheckout: () => set({
        selectedAddress: null,
        selectedShipping: { id: '2', type: 'Regular', icon: 'bicycle-outline', price: 2.99, days: '3-5 days', arrival: 'Mar 10 – 12' },
        selectedPayment: { id: 'wallet', label: 'Potea E-Wallet', method: 'wallet', icon: 'wallet-outline' },
        appliedPromo: null,
        checkoutCart: []
    }),
}));

export default useCheckoutStore;
