require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.static('public'));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount < 1) {
    return res.status(400).send({ error: 'Invalid amount' });
  }

  const amountInCents = Math.round(amount * 100);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'aed',
          product_data: {
            name: 'Koora Sports Booking',
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      custom_fields: [
        {
          key: 'booking_note',
          label: {
            type: 'custom',
            custom: 'Notes For Your Booking',
          },
          type: 'text'
        }
      ],
      success_url: 'https://koorasports.onrender.com/success',
      cancel_url: 'https://koorasports.onrender.com/cancel',
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ خطأ في إنشاء جلسة الدفع:', error);
    res.status(500).send('حدث خطأ أثناء إنشاء جلسة الدفع');
  }
});

app.listen(4242, () => console.log('✅ Server running on http://localhost:4242'));