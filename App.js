import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Auth Screens
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LetsYouInScreen from './src/screens/LetsYouInScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import FillProfileScreen from './src/screens/FillProfileScreen';
import CreatePinScreen from './src/screens/CreatePinScreen';
import SetFingerprintScreen from './src/screens/SetFingerprintScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import OTPVerificationScreen from './src/screens/OTPVerificationScreen';
import CreateNewPasswordScreen from './src/screens/CreateNewPasswordScreen';

// Main App Screens
import MainTabNavigator from './src/navigation/MainTabNavigator';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import ShippingAddressScreen from './src/screens/ShippingAddressScreen';
import ChooseShippingScreen from './src/screens/ChooseShippingScreen';
import PromoCodeScreen from './src/screens/PromoCodeScreen';
import PaymentMethodScreen from './src/screens/PaymentMethodScreen';
import OrderSuccessScreen from './src/screens/OrderSuccessScreen';
import TrackOrderScreen from './src/screens/TrackOrderScreen';
import LeaveReviewScreen from './src/screens/LeaveReviewScreen';

// Wallet Screens
import EWalletScreen from './src/screens/EWalletScreen';
import TopUpWalletScreen from './src/screens/TopUpWalletScreen';
import TopUpMethodScreen from './src/screens/TopUpMethodScreen';
import WalletPinScreen from './src/screens/WalletPinScreen';
import TransactionHistoryScreen from './src/screens/TransactionHistoryScreen';
import EReceiptScreen from './src/screens/EReceiptScreen';

// Profile & Settings Screens
import EditProfileScreen from './src/screens/EditProfileScreen';
import AddressScreen from './src/screens/AddressScreen';
import AddAddressScreen from './src/screens/AddAddressScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import SecurityScreen from './src/screens/SecurityScreen';
import LanguageScreen from './src/screens/LanguageScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import HelpCenterScreen from './src/screens/HelpCenterScreen';
import CustomerServiceChatScreen from './src/screens/CustomerServiceChatScreen';
import InviteFriendsScreen from './src/screens/InviteFriendsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#FFFFFF' }
          }}
        >
          {/* ── Onboarding & Auth ── */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="LetsYouIn" component={LetsYouInScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="FillProfile" component={FillProfileScreen} />
          <Stack.Screen name="CreatePin" component={CreatePinScreen} />
          <Stack.Screen name="SetFingerprint" component={SetFingerprintScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
          <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} />

          {/* ── Main App ── */}
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen name="Wishlist" component={WishlistScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />

          {/* ── Cart & Checkout ── */}
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="ShippingAddress" component={ShippingAddressScreen} />
          <Stack.Screen name="ChooseShipping" component={ChooseShippingScreen} />
          <Stack.Screen name="PromoCode" component={PromoCodeScreen} />
          <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
          <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
          <Stack.Screen name="TrackOrder" component={TrackOrderScreen} />
          <Stack.Screen name="LeaveReview" component={LeaveReviewScreen} />

          {/* ── Wallet Flow ── */}
          <Stack.Screen name="EWallet" component={EWalletScreen} />
          <Stack.Screen name="TopUpWallet" component={TopUpWalletScreen} />
          <Stack.Screen name="TopUpMethod" component={TopUpMethodScreen} />
          <Stack.Screen name="WalletPin" component={WalletPinScreen} />
          <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
          <Stack.Screen name="EReceipt" component={EReceiptScreen} />

          {/* ── Profile & Settings ── */}
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Address" component={AddressScreen} />
          <Stack.Screen name="AddAddress" component={AddAddressScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
          <Stack.Screen name="Security" component={SecurityScreen} />
          <Stack.Screen name="Language" component={LanguageScreen} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
          <Stack.Screen name="CustomerServiceChat" component={CustomerServiceChatScreen} />
          <Stack.Screen name="InviteFriends" component={InviteFriendsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
