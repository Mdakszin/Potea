import React, { useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Full Stripe support on Web using @stripe/stripe-js and @stripe/react-stripe-js.
const StripeProviderWrapper = ({ children, publishableKey }) => {
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
