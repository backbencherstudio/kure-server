"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payment = void 0;
const mongoose_1 = require("mongoose");
const paymentSchema = new mongoose_1.Schema({
    amount: {
        type: Number
    }
});
exports.payment = (0, mongoose_1.model)('payment', paymentSchema);
