app.post("/create-checkout-session", async (req, res) => {
  const { amount, notes } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: 'Koora Sports Booking'
            },
            unit_amount: Math.round(amount * 100)
          },
          quantity: 1
        }
      ],
      success_url: 'https://koorasports.ae/success',
      cancel_url: 'https://koorasports.ae/cancel',
      metadata: {
        notes: notes || ''
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});