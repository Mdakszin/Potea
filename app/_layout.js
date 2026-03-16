import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import StripeProviderWrapper from '../src/components/StripeProviderWrapper';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StripeProviderWrapper publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}>
        <ThemeProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <Stack screenOptions={{ headerShown: false }} />
          </AuthProvider>
        </ThemeProvider>
      </StripeProviderWrapper>
    </SafeAreaProvider>
  );
}
