/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import path from 'path';
import Stripe from 'stripe';
import config from './app/config';
import { pathName } from './app/Modules/audioPath/audiopath.module';
import router from './app/routes';
import { User } from './app/Modules/User/user.model';
import globalErrorHandler from './app/middleware/globalErrorHandlear';
  
const app: Application = express();
// const stripe = new Stripe(config.stripe_test_secret_key as string);
const stripe = new Stripe(config.stripe_live_secret_key as string);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173', "https://admin.hypno4u.com", "https://hypno4u.com"],  
    credentials: true,
  })
);

app.get('/test', async (req, res) => {
  const a = 'server running successfully';
  res.send(a);
});
  
app.use("/api/v1", router)

app.use('/uploads', express.static('uploads'));  

app.get('/get-audios', async (req, res) => {
  try {
    const audios = await pathName.find(); 
    const audioUrls = audios.map(audio => audio.path);  

    res.status(200).json(audioUrls);
  } catch (err) {
    console.error('Error fetching audio URLs:', err);
    res.status(500).json({ message: 'Error fetching audio URLs' });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

app.post('/upload-audio', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  try {
    const newAudioUrl = `/uploads/${req.file.filename}`;
    res.status(200).send({ filePath: newAudioUrl });
  } catch (err) {
    console.error('Error saving audio URL:', err);
    res.status(500).send('Error saving audio URL');
  }
});

app.post("/path-name", async (req, res) => {
  const { audio, category, categoryStatus, name } = req.body;
  if(path){
    const result = await pathName.create({ audio ,  category, categoryStatus , name});
    res.send(result);
    return
  } 
});

app.patch("/api/v1/path-name", async (req, res) => {
  const {getId : id,  audio, category, categoryStatus, name } = req.body;  
  if(path){
      const result = await pathName.findByIdAndUpdate( id , { audio ,  category, categoryStatus , name}, {new : true, runValidators : true} );
      res.send(result);
    return    
  } 
});


app.get("/api/v1/get-path-name", async (req, res) => {
  const categoryStatus = req?.query?.showCategoryStatus   
  const email = req?.query?.email
  const isExists = await User.findOne({email})  

  const selectedPaths = await pathName.find({ 
    _id: { $in: isExists?.selectedBodyAudios }
  });
  
  const groupedSelectedPaths = selectedPaths.reduce((groups : any, path) => {
    const { category } = path;

    if (!groups[category] ) {
      groups[category] = [];
    }
    groups[category].push(path);

    return groups;

  }, {});
  
  const selectedBodyitem = groupedSelectedPaths?.body;
  const selectedMinditem = groupedSelectedPaths?.mind;
  const selectedEgoitem = groupedSelectedPaths?.ego;
  const selectedselfitem = groupedSelectedPaths?.self;

    const result = await pathName.find();

    const self = await pathName.find({category: 'self', categoryStatus });
    const body = await pathName.find({category: 'body', categoryStatus});
    const mind = await pathName.find({category: 'mind', categoryStatus});
    const ego = await pathName.find({category: 'ego', categoryStatus});
    const vault = await pathName.find({category: 'vault'});    
    const intro = await pathName.find({category: 'intro'});    
     
    res.send({
      result,
      self,
      body,
      mind,
      ego, 
      selectedBodyitem,
      selectedMinditem,
      selectedEgoitem,
      selectedselfitem,
      vault,
      intro
    });

});

// ===========================================================================  Subscription 

app.get('/subscribe', async (req, res) => {
  const plan = req.query.plan;
  

  if (!plan || typeof plan !== 'string') {
    return res.send('Subscription plan not found');
  }

  let priceId;
  
  switch (plan?.toLowerCase()) {
      case 'silver':
      priceId = config.silver_plan_key; 
      break;
      case 'gold':
      priceId = config.golden_plan_key; 
      break;
      case 'dimond':
      priceId = config.dimond_plan_key; 
      break;
    default:
      return res.send('Subscription plan not found');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${config.client_base_url}daily-audios?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.client_base_url}/subscriptionplan`,
  });
    
  res.redirect(session.url as string);
});


app.get('/success', async (req, res) => {
  try {
    const sessionId = req?.query.session_id;
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).send('Invalid or missing session_id');
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'subscription.plan.product'],
    });
    const subscription = session.subscription as Stripe.Subscription;
    const subscriptionDetails = await stripe.subscriptions.retrieve(subscription.id, {
      expand: ['items.data.price'],
    });
    const planAmount = subscriptionDetails.items.data[0]?.price?.unit_amount || 0;
    const sessionData = {
      customer_id: subscription.customer || null,
      subscription_email: session.customer_details?.email || null,
      plan: planAmount / 100, 
      status: subscriptionDetails.status || null,
    };
    res.status(200).json(sessionData);
  } catch (error: any) {
    console.error('Error retrieving session:', error.message);
    res.status(500).json({ error: 'Failed to retrieve session details' });
  }
});

app.get('/cancel', (req, res) => {
  res.redirect('/');
});

app.get("/customers/:customerId", async(req, res)=>{
  const portalSession = await stripe.billingPortal.sessions.create({
    customer : req.params.customerId,
    return_url : `${config.client_base_url}`
  })
  res.redirect(portalSession.url)
} )


// app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
//   const sig = req.headers['stripe-signature'];  
//   let event;
//   try {
//       event = stripe.webhooks.constructEvent(req.body, sig, config.stripe_webhook_secret_key);
//   } catch (err : any) {
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   switch (event.type) {
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


app.use(globalErrorHandler);


export default app;
