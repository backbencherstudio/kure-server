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
exports.User = exports.TampUserCollection = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const TampUserSchema = new mongoose_1.Schema({
    id: {
        type: String,
    },
    otp: {
        type: String,
        required: [true, "Otp is required"],
    },
    selfId: {
        type: Number,
        default: 0
    },
    egoId: {
        type: Number,
        default: 0
    },
    mindId: {
        type: Number,
        default: 0
    },
    bodyId: {
        type: Number,
        default: 0
    },
    category: {
        type: [String],
    },
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    plan: {
        type: String,
        default: ""
    },
    price: {
        type: String,
        default: ""
    },
    userType: {
        type: String,
        default: ""
    },
    expiresDate: {
        type: Date,
    },
    orderID: { type: Number },
    payerID: { type: Number },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    selectedBodyAudios: {
        type: [Number],
        default: []
    },
    selectedMindAudios: {
        type: [Number],
        default: []
    },
    selectedEgoAudios: {
        type: [Number],
        default: []
    },
    selectedSelfAudios: {
        type: [Number],
        default: []
    },
    expiresAt: { type: Date, required: true },
}, {
    timestamps: true,
});
const userSchema = new mongoose_1.Schema({
    id: {
        type: String,
    },
    Id: {
        type: Number,
        required: [true, "Id is required"],
    },
    selfId: {
        type: Number,
        default: 0
    },
    egoId: {
        type: String,
        default: "0"
    },
    mindId: {
        type: String,
        default: "0"
    },
    bodyId: {
        type: String,
        default: "0"
    },
    category: {
        type: String,
    },
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
    },
    plan: {
        type: String,
        default: ""
    },
    price: {
        type: String,
        default: ""
    },
    userType: {
        type: String,
        default: ""
    },
    orderID: { type: String, default: "" },
    payerID: { type: String, default: "" },
    sessionId: { type: String, default: "" },
    expiresDate: {
        type: Date,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    selectedBodyAudios: {
        type: [String],
        default: []
    },
    selectedMindAudios: {
        type: [Number],
        default: []
    },
    selectedEgoAudios: {
        type: [Number],
        default: []
    },
    selectedSelfAudios: {
        type: [Number],
        default: []
    },
}, {
    timestamps: true,
});
userSchema.statics.isPasswordMatched = function (plainTextPassword, hashPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(plainTextPassword, hashPassword);
    });
};
exports.TampUserCollection = (0, mongoose_1.model)('TampUser', TampUserSchema);
exports.User = (0, mongoose_1.model)('User', userSchema);
