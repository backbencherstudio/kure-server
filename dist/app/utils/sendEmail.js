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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const sendEmail = (to, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com.',
        // port: 587, 
        port: 465,
        secure: true,
        auth: {
            user: config_1.default.sender_email,
            pass: config_1.default.email_pass,
        },
    });
    yield transporter.sendMail({
        from: config_1.default.sender_email,
        to,
        subject: 'Set your OTP withen 2m',
        text: '',
        html: `<div style="text-align: center; font-family: Arial, sans-serif; padding: 20px;">
        <p>Your OTP code is:</p>
        <p style="font-size: 24px; font-weight: bold; color: blue;">${otp}</p>
        <p>Please use this code within 2 minutes to reset your password.</p>
      </div>`,
    });
});
exports.sendEmail = sendEmail;
