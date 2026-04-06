import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="fill-profile" />
      <Stack.Screen name="create-pin" />
      <Stack.Screen name="set-fingerprint" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="create-new-password" />
    </Stack>
  );
}
