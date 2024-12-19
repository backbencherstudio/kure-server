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
import httpStatus from 'http-status';
import fs from "fs"
import { getAllAudiosCache, setAllAudiosCache } from './app/utils/cashData';
  
const app: Application = express();
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


app.delete("/api/v1/removeAudio/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const isAxists = await pathName.findById(id);
    if (!isAxists) {
      return res.status(httpStatus.NOT_FOUND).json({ message: "Audio not found" });
    }
    const audioPath = isAxists.audio;
    await pathName.findByIdAndDelete(id);
    const filePath = path.resolve(__dirname, "../uploads", path.basename(audioPath));
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting audio file:", err);
          return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to delete audio file" });
        }
        return res.status(httpStatus.OK).json({ message: "Audio deleted successfully" });
      });
    } else {
      console.warn("File does not exist:", filePath);
      return res.status(httpStatus.NOT_FOUND).json({ message: "Audio file not found on the server" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
  }
});


// app.get("/api/v1/get-path-name", async (req, res) => {
 

//   const categoryStatus = req?.query?.showCategoryStatus   
//   const email = req?.query?.email  


//   const isExists = await User.findOne({email})  
//   const selectedPaths = await pathName.find({ 
//     _id: { $in: isExists?.selectedBodyAudios }
//   });
//   const groupedSelectedPaths = selectedPaths.reduce((groups : any, path) => {
//     const { category } = path;
//     if (!groups[category] ) {
//       groups[category] = [];
//     }
//     groups[category].push(path);
//     return groups;
//   }, {});
//   const selectedBodyitem = groupedSelectedPaths?.body;
//   const selectedMinditem = groupedSelectedPaths?.mind;
//   const selectedEgoitem = groupedSelectedPaths?.ego;
//   const selectedselfitem = groupedSelectedPaths?.self;
//     const result = await pathName.find();
//     const self = await pathName.find({category: 'self', categoryStatus });
//     const body = await pathName.find({category: 'body', categoryStatus});
//     const mind = await pathName.find({category: 'mind', categoryStatus});
//     const ego = await pathName.find({category: 'ego', categoryStatus});
//     const vault = await pathName.find({category: 'vault'});    
//     const intro = await pathName.find({category: 'intro'});   
    
//     res.send({
//       result,
//       self,
//       body,
//       mind,
//       ego, 
//       selectedBodyitem,
//       selectedMinditem,
//       selectedEgoitem,
//       selectedselfitem,
//       vault,
//       intro
//     });

// });


// ===========================================================================  Subscription 


// app.get("/api/v1/get-path-name", async (req, res) => {
//   try {
//     const cacheData = await getAllAudiosCache();
//     if (cacheData?.length > 0) {
//       return res.send({ cacheData });
//     }

//     const categoryStatus = req.query.showCategoryStatus;
//     const email = req.query.email;

//     const isExists = await User.findOne({ email });
//     const selectedPaths = await pathName.find({
//       _id: { $in: isExists?.selectedBodyAudios || [] },
//     });

//     const groupedSelectedPaths = selectedPaths.reduce((groups: any, path) => {
//       const { category } = path;
//       if (!groups[category]) {
//         groups[category] = [];
//       }
//       groups[category].push(path);
//       return groups;
//     }, {});

//     const selectedBodyitem = groupedSelectedPaths?.body || [];
//     const selectedMinditem = groupedSelectedPaths?.mind || [];
//     const selectedEgoitem = groupedSelectedPaths?.ego || [];
//     const selectedselfitem = groupedSelectedPaths?.self || [];

//     const result = await pathName.find();
//     const self = await pathName.find({ category: "self", categoryStatus });
//     const body = await pathName.find({ category: "body", categoryStatus });
//     const mind = await pathName.find({ category: "mind", categoryStatus });
//     const ego = await pathName.find({ category: "ego", categoryStatus });
//     const vault = await pathName.find({ category: "vault" });
//     const intro = await pathName.find({ category: "intro" });

//     if (result.length > 0) {
//       await setAllAudiosCache(result);
//     }

//     res.send({
//       result,
//       self,
//       body,
//       mind,
//       ego,
//       selectedBodyitem,
//       selectedMinditem,
//       selectedEgoitem,
//       selectedselfitem,
//       vault,
//       intro,
//     });
//   } catch (error) {
//     console.error("Error in /api/v1/get-path-name:", error);
//     res.status(500).send({ error: "Internal Server Error" });
//   }
// });


app.get("/api/v1/get-path-name", async (req, res) => {
  try {
    const cacheData = await getAllAudiosCache();
    if (cacheData) {
      return res.send({result :cacheData});
    }

    const categoryStatus = req?.query.showCategoryStatus;
    const email = req.query.email;    

    const isExists = await User.findOne({ email });
    const selectedPaths = await pathName.find({
      _id: { $in: isExists?.selectedBodyAudios || [] },
    });

    const groupedSelectedPaths = selectedPaths.reduce((groups: any, path) => {
      const { category } = path;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(path);
      return groups;
    }, {});

    const selectedBodyitem = groupedSelectedPaths?.body || [];
    const selectedMinditem = groupedSelectedPaths?.mind || [];
    const selectedEgoitem = groupedSelectedPaths?.ego || [];
    const selectedselfitem = groupedSelectedPaths?.self || [];

    const result = await pathName.find();
    const self = await pathName.find({ category: "self", categoryStatus });
    const body = await pathName.find({ category: "body", categoryStatus });
    const mind = await pathName.find({ category: "mind", categoryStatus });
    const ego = await pathName.find({ category: "ego", categoryStatus });
    const vault = await pathName.find({ category: "vault" });
    const intro = await pathName.find({ category: "intro" });

    const dataToCache = {
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
      intro,
    };
    await setAllAudiosCache(dataToCache);
    res.send(dataToCache);
  } catch (error) {
    console.error("Error in /api/v1/get-path-name:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});





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
    success_url: `${config.client_base_url}/daily-audios?session_id={CHECKOUT_SESSION_ID}`,
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
app.use(globalErrorHandler);
export default app;
