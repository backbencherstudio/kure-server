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
exports.paymentController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const payment_servce_1 = require("./payment.servce");
// const paymentControl = catchAsync(async (req, res) => {
//     const { amount } = req.body;
//     const result = await PaymentServices.paymentFun(amount); 
//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         success: true,
//         message: 'Payment created successfully',
//         data: result,
//     });
// });
const executePaymentControl = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderID, payerID } = req.body;
    const result = yield payment_servce_1.PaymentServices.executePaymentFun(orderID, payerID);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Payment executed successfully',
        data: result,
    });
}));
const paymentWithStripe = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = req.body;
    const result = yield payment_servce_1.PaymentServices.stripePayment(amount);
    res.status(http_status_1.default.OK).json({
        success: true,
        message: 'Payment intent created successfully',
        data: result,
    });
}));
exports.paymentController = {
    // paymentControl, 
    executePaymentControl,
    paymentWithStripe,
};
