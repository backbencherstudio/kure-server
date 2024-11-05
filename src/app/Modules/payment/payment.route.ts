import express from 'express';
import { paymentController } from './payment.controller';

const router = express.Router();

router.post('/', paymentController.paymentControl);

router.post('/execute-payment', paymentController.executePaymentControl);

router.post('/create-payment-intent', paymentController.paymentWithStripe);

router.post('/stripe-withdraw', paymentController.paymentWithdrowWithStripe);


export const PaymentRouter = router;
