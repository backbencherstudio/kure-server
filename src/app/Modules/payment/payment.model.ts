import { model, Schema } from "mongoose";
import { TPaymentAmount } from "./payment.interface";


const paymentSchema = new Schema<TPaymentAmount>({
    amount : {
        type : Number
    }
})


export const payment = model<TPaymentAmount>('payment', paymentSchema);