// Updated initiate-payment.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone_number, amount, provider } = req.body;

    // Validate input
    if (!phone_number || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const PAYHERO_CONFIG = {
      apiUrl: 'https://backend.payhero.co.ke/api/v2/payments',
      basicAuthToken: 'Basic ZzA2bkw2eU4yT2wxUmFjUW9rZkE6c3hRek1kWGpSSzNmWWt0VWtJYVU2alpIWEoyTVhWSGVISEVqdDJxZg==',
      channelId: 4776,
      // Use provided provider or default to m-pesa
      provider: provider || 'm-pesa',
      callbackUrl: 'https://samttech.co.ke/callback'
    };

    // Generate a unique reference
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const payload = {
      amount: parseInt(amount),
      phone_number: phone_number,
      channel_id: PAYHERO_CONFIG.channelId,
      provider: PAYHERO_CONFIG.provider, // This will now be dynamic
      external_reference: `STARLINK-${timestamp}-${randomStr}`, 
      callback_url: PAYHERO_CONFIG.callbackUrl
    };

    // Log for debugging (remove in production)
    console.log('Sending payment request:', {
      ...payload,
      phone_number: phone_number.substring(0, 3) + '****' + phone_number.substring(7)
    });

    const response = await fetch(PAYHERO_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': PAYHERO_CONFIG.basicAuthToken
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('PayHero API error:', result);
      throw new Error(result.message || 'Payment initiation failed');
    }

    res.status(200).json({
      success: true,
      reference: result.reference,
      external_reference: result.external_reference,
      provider: PAYHERO_CONFIG.provider
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error' 
    });
  }
}