import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

interface StripeProviderWrapperProps {
  children: React.ReactNode;
  publishableKey: string;
}

const StripeProviderWrapper: React.FC<StripeProviderWrapperProps> = ({ children, publishableKey }) => {
  return (
    <StripeProvider publishableKey={publishableKey}>
      {children as any}
    </StripeProvider>
  );
};

export default StripeProviderWrapper;
