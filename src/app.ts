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
import { AppError } from './app/errors/AppErrors';

const app: Application = express();
const stripe = new Stripe(config.stripe_test_secret_key as string);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173'],  
    credentials: true,
  })
);
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


app.get("/api/v1/get-path-name", async (req, res) => {
  const categoryStatus = req?.query?.showCategoryStatus   
  const email = req?.query?.email   

  const isExists = await User.findOne({email})
  // if(!isExists){
  //   throw new AppError(404, "User Not Found")
  // }

  
  const selectedPaths = await pathName.find({ 
    _id: { $in: isExists?.selectedBodyAudios }
  });
  
  const groupedSelectedPaths = selectedPaths?.reduce((groups, path) => {
    const { category } = path;

    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(path);

    return groups;

  }, {});

  
  const selectedBodyitem = groupedSelectedPaths?.body;
  const selectedMinditem = groupedSelectedPaths?.mind;
  const selectedEgoitem = groupedSelectedPaths?.ego;
  const selectedselfitem = groupedSelectedPaths?.self;


  // try {
    const result = await pathName.find();

    const self = await pathName.find({category: 'self', categoryStatus });
    const body = await pathName.find({category: 'body', categoryStatus});
    const mind = await pathName.find({category: 'mind', categoryStatus});
    const ego = await pathName.find({category: 'ego', categoryStatus});

     
    res.send({
      result,
      self,
      body,
      mind,
      ego, 
      selectedBodyitem,
      selectedMinditem,
      selectedEgoitem,
      selectedselfitem});
});




// ===========================================================================  Subscription 

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
    // success_url: `${config.client_base_url}/login`,
    success_url: `${config.client_base_url}/daily-audios?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.client_base_url}/subscriptionplan`,
  });
    
  res.redirect(session.url);
});


app.get('/success', async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req?.query?.session_id, { 
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
  res.redirect(portalSession.url)
} )

app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];  
  let event;
  try {
      event = stripe.webhooks.constructEvent(req.body, sig, config.stripe_webhook_secret_key);
  } catch (err : any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed':
      console.log('New Subscription started!')
      console.log(116, event.data)
      break;

    // Event when the payment is successfull (every subscription interval)  
    case 'invoice.paid':
      console.log('Invoice paid')
      console.log(122, event.data)
      break;

    // Event when the payment failed due to card problems or insufficient funds (every subscription interval)  
    case 'invoice.payment_failed':  
      console.log('Invoice payment failed!')
      console.log(128, event.data)
      break;

    // Event when subscription is updated  
    case 'customer.subscription.updated':
      console.log('Subscription updated!')
      console.log(134, event.data)
      break

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.send();
});


export default app;
