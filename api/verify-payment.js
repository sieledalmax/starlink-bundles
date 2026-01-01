export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ error: 'Reference is required' });
    }

    // Use the SAME basicAuthToken from your initiate-payment.js
    const basicAuthToken = 'Basic M0YzdVM4dHQ0Q2YxTG1zQjRhc0c6SjdYTmg4S2Vsd1hDNUhiNUNsQzd1VUthazIxWko0N0xpN2hicFdTZg==';

    const response = await fetch(`https://backend.payhero.co.ke/api/v2/transaction-status?reference=${reference}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": basicAuthToken
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Payment verification failed');
    }

    res.status(200).json({
      success: true,
      status: result.status,
      data: result
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      success: false
    });
  }
}