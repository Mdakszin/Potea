import Constants from 'expo-constants';

// We get the base URL for the API. In expo development, it's usually localhost:8081 or the machine IP.
// We can use Constants.expoConfig.hostUri or just relative path if supported by fetch on both platforms.
// For simplicity in this demo, we'll try to determine the correct host.
const getBaseUrl = () => {
  if (__DEV__) {
    // Expo Go doesn't always handle relative URLs correctly for API routes.
    // In production, we'd use the deployed domain.
    return ''; // Relative path usually works on Web, but for Mobile we might need absolute.
  }
  return '';
};

export const stripeService = {
  fetchUserPurchases: async (userId) => {
    try {
      // Using relative path for API routes
      const response = await fetch(`/api/purchases?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch purchases from server');
      }
      return await response.json();
    } catch (error) {
      console.error('Error in stripeService.fetchUserPurchases:', error);
      throw error;
    }
  }
};
