import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PaymentServices } from "./payment.servce";

const paymentControl = catchAsync(async (req, res) => {
    const { amount } = req.body;
    const result = await PaymentServices.paymentFun(amount); 
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Payment created successfully',
        data: result,
    });
});

const executePaymentControl = catchAsync(async (req, res) => {
    const { orderID, payerID } = req.body;      
    const result = await PaymentServices.executePaymentFun(orderID, payerID); 
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Payment executed successfully',
        data: result,
    });
});

const paymentWithStripe = catchAsync(async (req, res) => {
    const { amount } = req.body;
    const result = await PaymentServices.stripePayment(amount);
    res.status(httpStatus.OK).json({
        success: true,
        message: 'Payment intent created successfully',
        data: result,
    });
});



export const paymentController = {
    paymentControl,
    executePaymentControl,
    paymentWithStripe
};
