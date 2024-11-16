"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-undef */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("./app/config"));
const audiopath_module_1 = require("./app/Modules/audioPath/audiopath.module");
const routes_1 = __importDefault(require("./app/routes"));
const user_model_1 = require("./app/Modules/User/user.model");
const app = (0, express_1.default)();
const stripe = new stripe_1.default(config_1.default.stripe_test_secret_key);
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173'],
    credentials: true,
}));
app.use("/api/v1", routes_1.default);
app.use('/uploads', express_1.default.static('uploads'));
app.get('/get-audios', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const audios = yield audiopath_module_1.pathName.find();
        const audioUrls = audios.map(audio => audio.path);
        res.status(200).json(audioUrls);
    }
    catch (err) {
        console.error('Error fetching audio URLs:', err);
        res.status(500).json({ message: 'Error fetching audio URLs' });
    }
}));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage: storage });
app.post('/upload-audio', upload.single('audio'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }
    try {
        const newAudioUrl = `/uploads/${req.file.filename}`;
        res.status(200).send({ filePath: newAudioUrl });
    }
    catch (err) {
        console.error('Error saving audio URL:', err);
        res.status(500).send('Error saving audio URL');
    }
}));
app.post("/path-name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { audio, category, categoryStatus, name } = req.body;
    if (path_1.default) {
        const result = yield audiopath_module_1.pathName.create({ audio, category, categoryStatus, name });
        res.send(result);
        return;
    }
}));
app.get("/api/v1/get-path-name", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const categoryStatus = (_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.showCategoryStatus;
    const email = (_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.email;
    const isExists = yield user_model_1.User.findOne({ email });
    // if(!isExists){
    //   throw new AppError(404, "User Not Found")
    // }
    const selectedPaths = yield audiopath_module_1.pathName.find({
        _id: { $in: isExists === null || isExists === void 0 ? void 0 : isExists.selectedBodyAudios }
    });
    const groupedSelectedPaths = selectedPaths === null || selectedPaths === void 0 ? void 0 : selectedPaths.reduce((groups, path) => {
        const { category } = path;
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(path);
        return groups;
    }, {});
    const selectedBodyitem = groupedSelectedPaths === null || groupedSelectedPaths === void 0 ? void 0 : groupedSelectedPaths.body;
    const selectedMinditem = groupedSelectedPaths === null || groupedSelectedPaths === void 0 ? void 0 : groupedSelectedPaths.mind;
    const selectedEgoitem = groupedSelectedPaths === null || groupedSelectedPaths === void 0 ? void 0 : groupedSelectedPaths.ego;
    const selectedselfitem = groupedSelectedPaths === null || groupedSelectedPaths === void 0 ? void 0 : groupedSelectedPaths.self;
    // try {
    const result = yield audiopath_module_1.pathName.find();
    const self = yield audiopath_module_1.pathName.find({ category: 'self', categoryStatus });
    const body = yield audiopath_module_1.pathName.find({ category: 'body', categoryStatus });
    const mind = yield audiopath_module_1.pathName.find({ category: 'mind', categoryStatus });
    const ego = yield audiopath_module_1.pathName.find({ category: 'ego', categoryStatus });
    res.send({
        result,
        self,
        body,
        mind,
        ego,
        selectedBodyitem,
        selectedMinditem,
        selectedEgoitem,
        selectedselfitem
    });
}));
// ===========================================================================  Subscription 
app.get('/subscribe', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    const session = yield stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        // success_url: `${config.client_base_url}/login`,
        success_url: `${config_1.default.client_base_url}/daily-audios?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config_1.default.client_base_url}/subscriptionplan`,
    });
    res.redirect(session.url);
}));
app.get('/success', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e;
    const session = yield stripe.checkout.sessions.retrieve((_c = req === null || req === void 0 ? void 0 : req.query) === null || _c === void 0 ? void 0 : _c.session_id, {
        expand: ['subscription', 'subscription.plan.product']
    });
    const sessionData = {
        customer_id: (_d = session === null || session === void 0 ? void 0 : session.subscription) === null || _d === void 0 ? void 0 : _d.customer,
        subscription_email: (_e = session === null || session === void 0 ? void 0 : session.customer_details) === null || _e === void 0 ? void 0 : _e.email,
        plan: ((session === null || session === void 0 ? void 0 : session.subscription.plan.amount) / 100),
        status: session === null || session === void 0 ? void 0 : session.subscription.status
    };
    res.send(sessionData);
}));
app.get('/cancel', (req, res) => {
    res.redirect('/');
});
app.get("/customers/:customerId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const portalSession = yield stripe.billingPortal.sessions.create({
        customer: req.params.customerId,
        return_url: `${config_1.default.client_base_url}`
    });
    res.redirect(portalSession.url);
}));
app.post('/webhook', express_1.default.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, config_1.default.stripe_webhook_secret_key);
    }
    catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    switch (event.type) {
        case 'checkout.session.completed':
            console.log('New Subscription started!');
            console.log(116, event.data);
            break;
        // Event when the payment is successfull (every subscription interval)  
        case 'invoice.paid':
            console.log('Invoice paid');
            console.log(122, event.data);
            break;
        // Event when the payment failed due to card problems or insufficient funds (every subscription interval)  
        case 'invoice.payment_failed':
            console.log('Invoice payment failed!');
            console.log(128, event.data);
            break;
        // Event when subscription is updated  
        case 'customer.subscription.updated':
            console.log('Subscription updated!');
            console.log(134, event.data);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    res.send();
});
exports.default = app;
