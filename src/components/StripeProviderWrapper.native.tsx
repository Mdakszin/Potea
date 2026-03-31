import React from 'react';

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
    // Lazy load Stripe to prevent crash at the top-level import if native modules are missing
    const { StripeProvider } = require('@stripe/stripe-react-native');
    
    return (
      <StripeProvider publishableKey={publishableKey}>
        {children as any}
      </StripeProvider>
    );
  } catch (error) {
    console.error('Stripe native module not found or failed to load. Ensure you are using a development client with the Stripe plugin.', error);
    return <>{children}</>;
  }
};

export default StripeProviderWrapper;
