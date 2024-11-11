/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Stripe from 'stripe';
import config from './app/config';
import router from './app/routes';

const app: Application = express();
const stripe = new Stripe(config.stripe_test_secret_key as string);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173'], 
    credentials: true,
  }),
);

app.use("/api/v1", router)

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
    case 'test':
      priceId = 'price_1QJqiPCeMjBQYGyCqZZKVILH'; 
      break;
    case 'silver':
      priceId = 'price_1QJp7hCeMjBQYGyC82uuSJsN'; 
      break;
    case 'gold':
      priceId = 'price_1QJrTXCeMjBQYGyCvr2E851m';
      break;
    case 'dimond':
      priceId = 'price_1QJrX2CeMjBQYGyCWkpCn0Yi';
      break;
    default:
      return res.send('Subscription plan not found');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    // success_url: `${config.client_base_url}/success?session_id={CHECKOUT_SESSION_ID}`,
    success_url: `${config.client_base_url}/daily-audios?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.client_base_url}/subscriptionplan`,
  });
    
  
  // console.log(51, session?.payment_method_configuration_details);

  res.redirect(session.url);
});


app.get('/success', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id, { 
    expand: ['subscription', 'subscription.plan.product'] 
  });
 
  const sessionData = {
    customer_id : session?.subscription?.customer,
    subscription_email : session?.customer_details?.email,
    plan : (session?.subscription.plan.amount / 100),
    status : session?.subscription.status
  }

  res.send(sessionData);
});



app.get('/cancel', (req, res) => {
  res.redirect('/');
});

app.get("/customers/:customerId", async(req, res)=>{
  const portalSession = await stripe.billingPortal.sessions.create({
    customer : req.params.customerId,
    return_url : `${config.client_base_url}`
  })

  // console.log(88, {portalSession});

  res.redirect(portalSession.url)
} )

// app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
//   const sig = req.headers['stripe-signature'];

//   console.log(140, req.body.data.object.hosted_invoice_url);
//   console.log(141, req.body.data.object.invoice_pdf);

  
//   let event;
//   try {
//       event = stripe.webhooks.constructEvent(req.body, sig, config.stripe_webhook_secret_key);
//   } catch (err : any) {
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // Handle the event
//   switch (event.type) {
//     //Event when the subscription started
//     case 'checkout.session.completed':
//       console.log('New Subscription started!')
//       console.log(116, event.data)
//       break;

//     // Event when the payment is successfull (every subscription interval)  
//     case 'invoice.paid':
//       console.log('Invoice paid')
//       console.log(122, event.data)
//       break;

//     // Event when the payment failed due to card problems or insufficient funds (every subscription interval)  
//     case 'invoice.payment_failed':  
//       console.log('Invoice payment failed!')
//       console.log(128, event.data)
//       break;

//     // Event when subscription is updated  
//     case 'customer.subscription.updated':
//       console.log('Subscription updated!')
//       console.log(134, event.data)
//       break

//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   res.send();
// });


app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripe_webhook_secret_key);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] <--  [400] POST ${req.originalUrl} - Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Log the event in a structured format
  const logEvent = (direction, event) => {
    const timestamp = new Date().toISOString();
    const eventType = event.type;
    const eventId = event.id;
    console.log(`${timestamp}  ${direction} ${eventType} [${eventId}]`);
  };

  // Log incoming event
  logEvent('-->', event);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      console.log(`[${new Date().toISOString()}] Subscription started!`);
      console.log('Details:', event.data.object);
      break;

    case 'invoice.paid':
      console.log(`[${new Date().toISOString()}] Invoice paid`);
      console.log('Details:', event.data.object);
      break;

    case 'invoice.payment_failed':
      console.log(`[${new Date().toISOString()}] Invoice payment failed!`);
      console.log('Details:', event.data.object);
      break;

    case 'customer.subscription.updated':
      console.log(`[${new Date().toISOString()}] Subscription updated!`);
      console.log('Details:', event.data.object);
      break;

    default:
      console.log(`[${new Date().toISOString()}] Unhandled event type ${event.type}`);
      break;
  }

  // Log outgoing response
  logEvent('<--', event);

  res.send();
});



export default app;