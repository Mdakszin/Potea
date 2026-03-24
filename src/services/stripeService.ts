export interface StripePurchase {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description?: string;
  receipt_url?: string;
  metadata?: Record<string, any>;
}

export interface StripePurchasesResponse {
  data: StripePurchase[];
  has_more: boolean;
  total_count?: number;
}

export const stripeService = {
  fetchUserPurchases: async (
    userId: string, 
    limit: number = 10, 
    startingAfter: string | null = null
  ): Promise<StripePurchasesResponse> => {
    try {
      let url = `/api/purchases?userId=${userId}&limit=${limit}`;
      if (startingAfter) {
        url += `&starting_after=${startingAfter}`;
      }
      // Using relative path for API routes
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch purchases from server');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in stripeService.fetchUserPurchases:', error);
      throw error;
    }
  }
};
