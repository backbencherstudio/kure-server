/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import paypal from "paypal-rest-sdk";
import { AppError } from "../../errors/AppErrors";
import Stripe from "stripe";
// import { TPaymentAmount } from "./payment.interface";


paypal.configure({
    // 'mode': 'live', 
    'mode': 'sandbox', 
    'client_id': 'AUHCLLlrN0fUteHTIYiBX7ZOoduVvF0mp4QSDUQOf_m2GohS_kVr6z8CbTJgOMnGNyMAiLsx_EWf8l5C',
    'client_secret': 'EDwN_-iERzhwDKJJ4x84VM3V03dWv4laHpF21fnDvmPup5a-PWvv8poGghba6XvtydL0V04iwjIag63z'
});

const executePaymentFun = (orderID : string, payerID : string) => {
    return new Promise((resolve, reject) => {
        paypal.payment.execute(orderID, {
            payer_id: payerID  
        }, (error, payment) => {
            if (error) {
                reject(new AppError(httpStatus.BAD_REQUEST, error.message));
            } else {
                resolve(payment);
            }
        });
    });
};


const stripe = new Stripe('sk_test_51QFpATLEvlBZD5dJjsneUWfIN2W2ok3yfxHN7qyLB2TRPYn0bs0UCzWytfZgZwrpcboY5GXMyen4BwCPthGLCrRX001T5gDgLK');

const stripePayment = async (amount: number) => {   
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount  * 100, 
            currency: 'usd',
            payment_method_types: ['card'],
        });
        return { clientSecret: paymentIntent.client_secret };
    } catch (error: any) {
        throw new AppError(httpStatus.BAD_REQUEST, error.message);
    }
};




export const PaymentServices = {    
    // paymentFun,
    executePaymentFun,
    stripePayment,
};