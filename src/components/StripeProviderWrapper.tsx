import React, { useMemo } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

interface StripeProviderWrapperProps {
  children: React.ReactNode;
  publishableKey: string | null | undefined;
}

// Full Stripe support on Web using @stripe/stripe-js and @stripe/react-stripe-js.
const StripeProviderWrapper: React.FC<StripeProviderWrapperProps> = ({ children, publishableKey }) => {
  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  if (!stripePromise) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProviderWrapper;
