import express from 'express';
import { paymentController } from './payment.controller';

const router = express.Router();

router.post('/', paymentController.paymentControl);

router.post('/withdraw', paymentController.paymentWithdrowWithPaypal);

router.post('/execute-payment', paymentController.executePaymentControl);

router.post('/create-payment-intent', paymentController.paymentWithStripe);


export const PaymentRouter = router;
