import { create } from 'zustand';

const useCheckoutStore = create((set) => ({
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
