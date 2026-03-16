const STRIPE_SECRET_KEY = process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    // In a real app, you would verify the user session here.
    // For this implementation, we'll fetch charges from Stripe.
    // Note: Stripe charges don't directly have a 'userId' field unless passed in metadata.
    // We'll search for charges where the description contains the userId.
    
    const response = await fetch(`https://api.stripe.com/v1/charges?limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.json();

    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 500 });
    }

    // Filter charges by userId in description (as set in stripe-payment.js)
    const userPurchases = data.data.filter(charge => 
      charge.description && charge.description.includes(userId)
    );

    return Response.json({ 
      purchases: userPurchases.map(charge => ({
        id: charge.id,
        amount: charge.amount / 100, // Convert from cents
        currency: charge.currency,
        status: charge.status,
        date: new Date(charge.created * 1000).toISOString(),
        description: charge.description,
        receipt_url: charge.receipt_url
      }))
    });
  } catch (error) {
    console.error('Stripe API Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
