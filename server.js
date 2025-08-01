const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const dotenv = require('dotenv');
dotenv.config();

app.use(express.static('public'));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { amount, notes } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aed',
            product_data: {
              name: 'Koora Sports Payment',
            },
            unit_amount: Math.round(amount * 100), // تحويل المبلغ من دراهم لفلس
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://koorasports.onrender.com/success',
      cancel_url: 'https://koorasports.onrender.com/cancel',
      metadata: {
        notes: notes || '',  // هنا نخزن ملاحظات الحجز لو حدا كتبها
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(4242, () => console.log('✅ Server running on http://localhost:4242'));