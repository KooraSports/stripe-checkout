app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: 'Koora Sports Payment',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://koorasports.onrender.com/success',
      cancel_url: 'https://koorasports.onrender.com/cancel',

      custom_fields: [
        {
          key: 'notes_for_booking',
          label: {
            type: 'custom',
            custom: 'Notes For Your Booking',
          },
          type: 'text',
          optional: true,
        },
      ]
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
});