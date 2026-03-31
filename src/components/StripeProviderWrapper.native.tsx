import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

interface StripeProviderWrapperProps {
  children: React.ReactNode;
  publishableKey: string;
}

const StripeProviderWrapper: React.FC<StripeProviderWrapperProps> = ({ children, publishableKey }) => {
  if (!publishableKey) {
    console.warn('Stripe publishable key is missing. Stripe features will be disabled.');
    return <>{children}</>;
  }

  try {
    return (
      <StripeProvider publishableKey={publishableKey}>
        {children as any}
      </StripeProvider>
    );
  } catch (error) {
    console.error('Failed to initialize StripeProvider:', error);
    return <>{children}</>;
  }
};

export default StripeProviderWrapper;
