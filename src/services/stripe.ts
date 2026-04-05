/**
 * Web fallback for the Stripe hook
 */
export const useAppStripe = () => {
    return {
        initPaymentSheet: async (params: any) => ({ error: { message: 'In-app payments are currently only supported on our mobile app. Please download the iOS or Android app to subscribe.' } }),
        presentPaymentSheet: async () => ({ error: { message: 'Not supported on web', code: 'Canceled' } }),
    };
};
