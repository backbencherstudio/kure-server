"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRouter = void 0;
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("./payment.controller");
const router = express_1.default.Router();
// router.post('/', paymentController.paymentControl);
router.post('/execute-payment', payment_controller_1.paymentController.executePaymentControl);
router.post('/create-payment-intent', payment_controller_1.paymentController.paymentWithStripe);
exports.PaymentRouter = router;
