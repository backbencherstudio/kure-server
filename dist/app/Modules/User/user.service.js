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
exports.UserServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppErrors_1 = require("../../errors/AppErrors");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const user_model_1 = require("./user.model");
const sendEmail_1 = require("../../utils/sendEmail");
const user_utils_1 = require("./user.utils");
const sendEmailToUser_1 = require("../../utils/sendEmailToUser");
// const getAllUserFromDB = async (payload : string ) =>{ 
//   if(payload === "all"){
//     const result = await User.find()
//     return result
//   }
//   if(payload === "inactive"){
//     const date : any = new Date()
//     const result2 = await User.find()
//     const filterData = result2.filter(item => {
//       const createdAtDate : any = new Date(item.createdAt);
//       const timeDifferenceInDays = Math.floor((date - createdAtDate) / (1000 * 60 * 60 * 24)); 
//       return parseInt(timeDifferenceInDays) > item.selfId; 
//     });  
//     return filterData
//   }
//   const isSubscribeUser = payload === "nonSubscriber"
//   const result = await User.find({isDeleted : isSubscribeUser })
//   return result
// }
const getAllUserFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload === "all") {
        const result = yield user_model_1.User.find();
        return result;
    }
    if (payload === "inactive") {
        const date = new Date();
        const result2 = yield user_model_1.User.find({ isDeleted: false });
        const filterData = result2.filter(item => {
            const createdAtDate = new Date(item.createdAt);
            const timeDifferenceInDays = Math.floor((date.getTime() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24));
            return typeof item.selfId === 'number' && timeDifferenceInDays > item.selfId;
        });
        return filterData;
    }
    const isSubscribeUser = payload === "nonSubscriber";
    const result = yield user_model_1.User.find({ isDeleted: isSubscribeUser });
    return result;
});
const getSingleUserFromDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findOne({ email });
    return result;
});
const updateAudionInfoIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield user_model_1.User.findOne({ email: payload === null || payload === void 0 ? void 0 : payload.email });
        if (!userData) {
            throw new AppErrors_1.AppError(404, "User not found");
        }
        const result = yield user_model_1.User.findOneAndUpdate({ email: payload.email }, { selfId: ((userData === null || userData === void 0 ? void 0 : userData.selfId) || 0) + 1 }, { new: true, runValidators: true });
        return result;
    }
    catch (error) {
        console.error("Error updating audio info:", error);
        throw new AppErrors_1.AppError(500, "Failed to update audio information");
    }
});
const logOutUpdateIntoDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        selectedBodyAudios: [],
        selectedMindAudios: [],
        selectedEgoAudios: [],
        selectedSelfAudios: []
    };
    const result = yield user_model_1.User.findOneAndUpdate({ email }, payload, { new: true, runValidators: true });
    return result;
});
const createUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = new Date(Date.now() + 2 * 60 * 1000);
    const isStudentExists = yield user_model_1.TampUserCollection.findOne({ email: payload === null || payload === void 0 ? void 0 : payload.email });
    const isStudentExistsInUser = yield user_model_1.User.findOne({ email: payload === null || payload === void 0 ? void 0 : payload.email });
    const hashedPassword = yield bcrypt_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.password, 8);
    if (isStudentExistsInUser) {
        throw new AppErrors_1.AppError(400, 'User already exists');
    }
    if (isStudentExists) {
        const data = {
            otp,
            password: hashedPassword,
            expiresAt: expirationTime
        };
        yield user_model_1.TampUserCollection.findOneAndUpdate({ email: payload === null || payload === void 0 ? void 0 : payload.email }, data, { new: true, runValidators: true });
        yield (0, sendEmail_1.sendEmail)(payload === null || payload === void 0 ? void 0 : payload.email, otp);
        return;
    }
    const newUserData = {
        email: payload === null || payload === void 0 ? void 0 : payload.email,
        password: hashedPassword,
        name: payload === null || payload === void 0 ? void 0 : payload.name,
        otp,
        expiresAt: expirationTime,
    };
    yield (0, sendEmail_1.sendEmail)(payload === null || payload === void 0 ? void 0 : payload.email, otp);
    yield user_model_1.TampUserCollection.create(newUserData);
    return {
        success: true,
        message: 'OTP sent to your email. Please verify to complete registration.',
    };
});
const resetPasswordIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExistsInUser = yield user_model_1.User.findOne({ email: payload === null || payload === void 0 ? void 0 : payload.email });
    if (!isUserExistsInUser) {
        throw new AppErrors_1.AppError(http_status_1.default.NOT_FOUND, "User Not Found");
    }
    const hashedPassword = yield bcrypt_1.default.hash(payload === null || payload === void 0 ? void 0 : payload.password, 8);
    const result = yield user_model_1.User.findOneAndUpdate({ email: payload.email }, { password: hashedPassword }, { new: true, runValidators: true });
    return result;
});
const setSelectedAudioIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExists = yield user_model_1.User.findOne({ email: payload === null || payload === void 0 ? void 0 : payload.email });
    if (!isExists) {
        throw new AppErrors_1.AppError(404, "user not found");
    }
    const updateData = {
        selectedBodyAudios: payload.idArray
    };
    const result = yield user_model_1.User.findOneAndUpdate({ email: payload.email }, updateData, { new: true, runValidators: true });
    return result;
});
const purchasePlan = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield user_model_1.User.findOne({ email: payload === null || payload === void 0 ? void 0 : payload.email });
    if ((userData === null || userData === void 0 ? void 0 : userData.sessionId) !== payload.sessionId) {
        const updateData = {
            $set: {
                selectedBodyAudios: [],
                selectedMindAudios: [],
                selectedEgoAudios: [],
                selectedSelfAudios: [],
                sessionId: payload.sessionId || "",
                isDeleted: false
            },
        };
        const result = yield user_model_1.User.findOneAndUpdate({ email: payload.email }, updateData, { new: true, runValidators: true });
        return result;
    }
    else {
        const updateData = {
            $set: {
                sessionId: payload.sessionId || "",
            },
        };
        const result = yield user_model_1.User.findOneAndUpdate({ email: payload.email }, updateData, { new: true, runValidators: true });
        return result;
    }
});
const userDeleteIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isUserExists = yield user_model_1.User.findOne({ email: payload });
    if (!isUserExists) {
        throw new AppErrors_1.AppError(http_status_1.default.BAD_REQUEST, "User not Found");
    }
    const result = yield user_model_1.User.findOneAndUpdate({ email: payload }, { isDeleted: true }, { new: true, runValidators: true });
    return result;
});
const verifyOTPintoDB = (email, otp, userType) => __awaiter(void 0, void 0, void 0, function* () {
    const tempUser = yield user_model_1.TampUserCollection.findOne({ email });
    if (!tempUser) {
        throw new AppErrors_1.AppError(http_status_1.default.BAD_REQUEST, 'User not found. Try again');
    }
    if (tempUser.otp !== otp) {
        throw new AppErrors_1.AppError(400, 'OTP not matched, try again');
    }
    if (new Date() > tempUser.expiresAt) {
        throw new AppErrors_1.AppError(400, 'OTP has expired, please request a new one');
    }
    const lastDocument = yield user_model_1.User.findOne().sort({ _id: -1 }).exec();
    const lastDocumentId = (lastDocument === null || lastDocument === void 0 ? void 0 : lastDocument.Id) || 0;
    const newUserData = {
        Id: lastDocumentId + 1,
        email: tempUser.email,
        password: tempUser.password,
        name: tempUser.name,
        userType
    };
    yield user_model_1.User.create(newUserData);
    yield user_model_1.TampUserCollection.deleteOne({ email });
    return {
        success: true,
        message: 'User registered successfully!',
    };
});
const loginUserIntoDB = (paylod) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield user_model_1.User.findOne({ email: paylod.email });
    if (!userData) {
        throw new AppErrors_1.AppError(http_status_1.default.NOT_FOUND, 'User is not found');
    }
    const res = yield bcrypt_1.default.compare(paylod.password, userData.password);
    if (!res) {
        throw new AppErrors_1.AppError(http_status_1.default.FORBIDDEN, 'password is not matched');
    }
    const jwtPayload = {
        email: userData.email,
        name: userData.name,
        userType: userData.userType,
        sessionId: userData.sessionId,
        createdAt: userData.createdAt
    };
    const accessToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    const refreshToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.jwt_refresh_secret, config_1.default.jwt_refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new AppErrors_1.AppError(http_status_1.default.UNAUTHORIZED, 'You are not authorize!');
    }
    const decoded = (0, user_utils_1.verifyToken)(token, config_1.default.jwt_refresh_secret);
    const { email } = decoded;
    const userData = yield user_model_1.User.findOne({ email });
    if (!userData) {
        throw new AppErrors_1.AppError(http_status_1.default.NOT_FOUND, 'User is not found');
    }
    const jwtPayload = {
        email: userData.email,
        name: userData.name,
        userType: userData.userType,
        expiresDate: userData.expiresDate,
        createdAt: userData.createdAt
    };
    const accessToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.jwt_access_secret, config_1.default.jwt_access_expires_in);
    return {
        accessToken,
    };
});
const deleteExpiredUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const now = new Date();
        const expiredUsers = yield user_model_1.TampUserCollection.find({ expiresAt: { $lte: now } });
        if (expiredUsers.length > 0) {
            console.log("deleted");
            yield user_model_1.TampUserCollection.deleteMany({ expiresAt: { $lte: now } });
        }
        else {
            console.log("No expired users found");
        }
    }
    catch (error) {
        console.error("Error deleting expired users:", error);
        throw new AppErrors_1.AppError(500, "Failed to delete expired users");
    }
});
const sendEmailToAllUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, subject, value, filePath } = payload;
    const result = yield (0, sendEmailToUser_1.sendEmailToUser)(email, subject, value, filePath);
    return result;
});
setInterval(() => {
    deleteExpiredUsers();
}, 24 * 60 * 60 * 1000);
exports.UserServices = {
    getAllUserFromDB,
    getSingleUserFromDB,
    updateAudionInfoIntoDB,
    createUserIntoDB,
    userDeleteIntoDB,
    verifyOTPintoDB,
    loginUserIntoDB,
    resetPasswordIntoDB,
    setSelectedAudioIntoDB,
    purchasePlan,
    refreshToken,
    logOutUpdateIntoDB,
    sendEmailToAllUser
};
