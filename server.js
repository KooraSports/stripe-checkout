require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.static('public'));
app.use(express.json());

let connectedAccountId = ''; // رح نخزن ID الحساب المتصل

// ✅ إنشاء حساب Connected جديد ورابط Onboarding
app.get('/onboard', async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    connectedAccountId = account.id;

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'https://koorasports.onrender.com/failed',
      return_url: 'https://koorasports.onrender.com/success',
      type: 'account_onboarding',
    });

    res.redirect(accountLink.url);
  } catch (err) {
    console.error('❌ خطأ في Onboarding:', err);
    res.status(500).send('فشل في إنشاء رابط Onboarding');
  }
});

// ✅ إنشاء جلسة الدفع
app.post('/create-checkout-session', async (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount < 1) {
    return res.status(400).send({ error: 'Invalid amount' });
  }

  if (!connectedAccountId) {
    return res.status(400).send({ error: 'No connected account yet' });
  }

  const amountInCents = Math.round(amount * 100);
  const stripeFee = Math.round(amountInCents * 0.029 + 120);
  const myFee = Math.round(amountInCents * 0.02);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
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
      mode: 'payment',
      payment_intent_data: {
        application_fee_amount: myFee,
        transfer_data: {
          destination: connectedAccountId,
        },
      },
      success_url: 'https://koorasports.onrender.com/success',
      cancel_url: 'https://koorasports.onrender.com/cancel',
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('❌ خطأ في جلسة الدفع:', error);
    res.status(500).send('حدث خطأ أثناء إنشاء جلسة الدفع');
  }
});

// ✅ لتأكيد التشغيل المحلي أو عالـRender
app.listen(4242, () => {
  console.log('✅ Server running on http://localhost:4242');
});