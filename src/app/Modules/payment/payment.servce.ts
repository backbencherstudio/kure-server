/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import paypal from "paypal-rest-sdk";
import { AppError } from "../../errors/AppErrors";
import Stripe from "stripe";
import { TPaymentAmount } from "./payment.interface";


paypal.configure({
    'mode': 'sandbox', 
    'client_id': 'AeMnBMlrboT2yZ77Ny1Zuwm-UnhJeeMzvE1D1ana1ZetUAzPfo7C-Px41iR4FijH5SN1FHEYrGokg3G2',
    'client_secret': 'EJkWItnQryzrdRMgIyVw8oJ1tgQBpWCe7EVTdoI2_EqLVIWO-xI_mX40IfFX6DUUxPLMIs6Sy2r2SVfr'
});

const paymentFun = (amount: TPaymentAmount): Promise<{ forwardLink: string }> => {

    return new Promise((resolve, reject) => {
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:5173/success",
                "cancel_url": "http://localhost:5173/cancel"
            },
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": amount.toString()
                },
                "description": "This is the payment description."
            }]
        };

        paypal.payment.create(create_payment_json, (error, payment) => {
            if (error) {
                reject(new AppError(httpStatus.BAD_REQUEST, error.message));
            } else if (payment && payment.links) {
                const forwardLink = payment.links.find((link: any) => link.rel === 'approval_url')?.href;
                if (forwardLink) {
                    resolve({ forwardLink });
                } else {
                    reject(new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Approval URL not found.'));
                }
            } else {
                reject(new AppError(httpStatus.INTERNAL_SERVER_ERROR, 'Payment object or links is undefined.'));
            }
        });
    });
};

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


const stripe = new Stripe('sk_test_51NFvq6ArRmO7hNaVBU6gVxCbaksurKb6Sspg6o8HePfktRB4OQY6kX5qqcQgfxnLnJ3w9k2EA0T569uYp8DEcfeq00KXKRmLUw');


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
    paymentFun,
    executePaymentFun,
    stripePayment
};
