/**
 * paymentService.ts
 * 
 * Helper to create Stripe Payment Intents directly from the client.
 * NOTE: For production, this logic MUST be moved to a secure backend 
 * (e.g. Firebase Cloud Functions) so the Secret Key is never bundled 
 * with the React Native app. It is placed here solely for prototyping.
 */

export const paymentService = {
    createPaymentIntent: async (amountInZar: number): Promise<{ clientSecret: string | null; error: string | null }> => {
        try {
            // Amount must be in the smallest currency unit (e.g. cents)
            const amountInCents = Math.round(amountInZar * 100);
            
            // Stripe expects form-urlencoded data
            const body = new URLSearchParams();
            body.append('amount', amountInCents.toString());
            body.append('currency', 'zar');
            body.append('automatic_payment_methods[enabled]', 'true');

            // The secret key must be provided from the environment
            const secretKey = process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY;
            
            if (!secretKey) {
                throw new Error("Stripe secret key is missing from environment variables.");
            }

            const response = await fetch('https://api.stripe.com/v1/payment_intents', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${secretKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body.toString(),
            });

            const paymentIntent = await response.json();

            if (paymentIntent.error) {
                return { clientSecret: null, error: paymentIntent.error.message };
            }

            return { clientSecret: paymentIntent.client_secret, error: null };
            
        } catch (error: any) {
            console.error('Error creating PaymentIntent:', error);
            return { clientSecret: null, error: error.message };
        }
    }
};
