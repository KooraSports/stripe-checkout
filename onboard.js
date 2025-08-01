const express = require('express');
const Stripe = require('stripe');
require('dotenv').config();

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // مفتاح Koora Sports

app.get('/onboard', async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'https://koorasports.onrender.com/failed',
      return_url: 'https://koorasports.onrender.com/success',
      type: 'account_onboarding',
    });

    res.redirect(accountLink.url);
  } catch (err) {
    console.error('خطأ:', err);
    res.status(500).send('فشل في إنشاء الرابط');
  }
});

app.listen(4242, () => console.log('✅ Listening on port 4242'));