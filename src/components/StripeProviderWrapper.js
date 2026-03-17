import React from 'react';

// Mock/Web-safe version of StripeProvider to avoid native module resolution errors on Web.
// To fully support Stripe on Web, we would integrate @stripe/stripe-js here.
const StripeProviderWrapper = ({ children, publishableKey }) => {
  return (
    <>
      {children}
    </>
  );
};

export default StripeProviderWrapper;
