export interface StripePurchase {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  description?: string;
  receipt_url?: string;
}

export interface StripePurchasesResponse {
  purchases: StripePurchase[];
  has_more: boolean;
  last_id: string | null;
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
