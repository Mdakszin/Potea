import React from 'react';
import { Stack } from 'expo-router';

export default function MainLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="search" />
            <Stack.Screen name="product-details" />
            <Stack.Screen name="notification" />
            <Stack.Screen name="cart" />
            <Stack.Screen name="my-favorites" />
            <Stack.Screen name="track-order" />
            <Stack.Screen name="e-receipt" />
            <Stack.Screen name="top-up" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="choose-shipping" />
            <Stack.Screen name="shipping-address" />
            <Stack.Screen name="address" />
            <Stack.Screen name="add-address" />
            <Stack.Screen name="payment-method" />
            <Stack.Screen name="stripe-payment" />
            <Stack.Screen name="transaction-history" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="notification-settings" />
            <Stack.Screen name="security" />
            <Stack.Screen name="language" />
            <Stack.Screen name="privacy-policy" />
            <Stack.Screen name="help-center" />
            <Stack.Screen name="invite-friends" />
            <Stack.Screen name="customer-service" />
            <Stack.Screen name="about-potea" />
            <Stack.Screen name="my-garden" />
            <Stack.Screen name="add-to-garden" />
            <Stack.Screen name="plant-care-details" />
            <Stack.Screen name="loyalty" />
            <Stack.Screen name="points-history" />
            <Stack.Screen name="subscription" />
            <Stack.Screen name="forum" />
            <Stack.Screen name="create-post" />
            <Stack.Screen name="post-details" />
        </Stack>
    );
}
