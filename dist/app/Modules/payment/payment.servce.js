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
exports.PaymentServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const paypal_rest_sdk_1 = __importDefault(require("paypal-rest-sdk"));
const AppErrors_1 = require("../../errors/AppErrors");
const stripe_1 = __importDefault(require("stripe"));
// import { TPaymentAmount } from "./payment.interface";
paypal_rest_sdk_1.default.configure({
    // 'mode': 'live', 
    'mode': 'sandbox',
    'client_id': 'AUHCLLlrN0fUteHTIYiBX7ZOoduVvF0mp4QSDUQOf_m2GohS_kVr6z8CbTJgOMnGNyMAiLsx_EWf8l5C',
    'client_secret': 'EDwN_-iERzhwDKJJ4x84VM3V03dWv4laHpF21fnDvmPup5a-PWvv8poGghba6XvtydL0V04iwjIag63z'
});
const executePaymentFun = (orderID, payerID) => {
    return new Promise((resolve, reject) => {
        paypal_rest_sdk_1.default.payment.execute(orderID, {
            payer_id: payerID
        }, (error, payment) => {
            if (error) {
                reject(new AppErrors_1.AppError(http_status_1.default.BAD_REQUEST, error.message));
            }
            else {
                resolve(payment);
            }
        });
    });
};
const stripe = new stripe_1.default('sk_test_51QFpATLEvlBZD5dJjsneUWfIN2W2ok3yfxHN7qyLB2TRPYn0bs0UCzWytfZgZwrpcboY5GXMyen4BwCPthGLCrRX001T5gDgLK');
const stripePayment = (amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'usd',
            payment_method_types: ['card'],
        });
        return { clientSecret: paymentIntent.client_secret };
    }
    catch (error) {
        throw new AppErrors_1.AppError(http_status_1.default.BAD_REQUEST, error.message);
    }
});
exports.PaymentServices = {
    // paymentFun,
    executePaymentFun,
    stripePayment,
};
