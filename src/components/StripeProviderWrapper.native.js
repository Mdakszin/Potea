import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

const StripeProviderWrapper = ({ children, publishableKey }) => {
  return (
    <StripeProvider publishableKey={publishableKey}>
      {children}
    </StripeProvider>
  );
};

export default StripeProviderWrapper;
