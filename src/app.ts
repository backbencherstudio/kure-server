import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Stripe from 'stripe';
import config from './app/config';

const app: Application = express();
const stripe = new Stripe('sk_test_51NFvq6ArRmO7hNaVBU6gVxCbaksurKb6Sspg6o8HePfktRB4OQY6kX5qqcQgfxnLnJ3w9k2EA0T569uYp8DEcfeq00KXKRmLUw');

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173'], 
    credentials: true,
  }),
);


app.get('/test', async (req, res) => {
  res.send('Server Running Successfully');
});

app.get('/subscribe', async (req, res) => {
  const plan = req.query.plan;

  if (!plan) {
    return res.send('Subscription plan not found');
  }

  let priceId;
  switch (plan.toLowerCase()) {
    case 'starter':
      priceId = 'price_1QITVgArRmO7hNaVMGUWyrM2'; 
      break;
    case 'pro':
      priceId = 'price_1QIS6yArRmO7hNaVd9LZWOs6';
      break;
    default:
      return res.send('Subscription plan not found');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${config.client_base_url}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.client_base_url}/subPayment`,
  });

  console.log(50, session);
  console.log(51, session?.payment_method_configuration_details);
  

  res.redirect(session.url);
});

app.get('/success', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id, { expand: ['subscription', 'subscription.plan.product'] });
  // console.log(62, "subscription data:", session?.subscription);
  console.log(60, "session_id", req.query.session_id);

  console.log(62, "session_id", session?.subscription);
  console.log(63, "subscription data:", session?.subscription?.id);
  console.log(64, "subscription country :", session?.customer_details?.address?.country);
  console.log(65, "subscription country email:", session?.customer_details?.email);

  // const successData = {
  //   subscription : session?.subscription,
  // }

  // console.log(69, successData);
  
  res.send('Subscribed successfully');
});

app.get('/cancel', (req, res) => {
  res.redirect('/');
});

app.get("/customers/:customerId", async(req, res)=>{
  const portalSession = await stripe.billingPortal.sessions.create({
    customer : req.params.customerId,
    return_url : `${config.client_base_url}`
  })

  console.log(88, {portalSession});
  
  res.redirect(portalSession.url)
} )

export default app;
// cus_RBAjle507vPOhf