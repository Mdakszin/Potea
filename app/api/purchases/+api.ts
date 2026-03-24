const STRIPE_SECRET_KEY = process.env.EXPO_PUBLIC_STRIPE_SECRET_KEY;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const limit = searchParams.get('limit') || '10';
    const startingAfter = searchParams.get('starting_after');

    let stripeUrl = `https://api.stripe.com/v1/charges?limit=${limit}`;
    if (startingAfter) {
      stripeUrl += `&starting_after=${startingAfter}`;
    }
    
    const response = await fetch(stripeUrl, {
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

    // Filter charges by userId in description (as set in stripe-payment.tsx)
    const userPurchases = data.data.filter((charge: any) => 
      charge.description && charge.description.includes(userId)
    );

    return Response.json({ 
      purchases: userPurchases.map((charge: any) => ({
        id: charge.id,
        amount: charge.amount / 100, // Convert from cents
        currency: charge.currency,
        status: charge.status,
        date: new Date(charge.created * 1000).toISOString(),
        description: charge.description,
        receipt_url: charge.receipt_url
      })),
      has_more: data.has_more,
      last_id: data.data.length > 0 ? data.data[data.data.length - 1].id : null
    });
  } catch (error) {
    console.error('Stripe API Error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
