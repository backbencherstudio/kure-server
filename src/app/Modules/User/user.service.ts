/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { AppError } from "../../errors/AppErrors";
import bcrypt from 'bcrypt'; 
import config from "../../config";
import { TampUserCollection, User } from "./user.model";
import { TLoginUser, TUser } from "./user.interface";
import { sendEmail } from "../../utils/sendEmail";
import { createToken, verifyToken } from "./user.utils";


const getSingleUserFromDB = async (email : string) =>{  
  const result = await User.findOne({email})
  return result
}

const updateAudionInfoIntoDB = async (payload : Partial<TUser> ) =>{  
  
  const userData = await User.findOne({email : payload?.email})
  if(!userData){
    throw new AppError(404, "user not found")
  }

  const dynamicKey = payload.category === 'body' ? 'bodyId' : 'mindId'; 
  if (payload[dynamicKey] !== undefined) {
    const previousIdValue = userData[dynamicKey] || "0"; 
    payload[dynamicKey] = (parseInt(previousIdValue, 10) + 1).toString(); 
  }
    
  if(payload.selectedMindAudios || payload.selectedBodyAudios ){
    const result = await User.findOneAndUpdate({email : payload.email}, payload, { new : true, runValidators : true })
    return result 
  }

  if(userData?.selfId === "end"){
    delete payload.selfId
  }
    if(payload.selfId === "end"){
    payload.egoId = "1"
  }  
    if(userData?.bodyId === "end"){
      delete payload.bodyId
  }  
    if(payload.bodyId === "end"){
    payload.mindId = "1"
  }

  const result = await User.findOneAndUpdate({email : payload.email}, payload, { new : true, runValidators : true })
  return result
}

const createUserIntoDB = async (payload: TUser) => {  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expirationTime = new Date(Date.now() + 2 * 60 * 1000);

  const isStudentExists = await TampUserCollection.findOne({ email: payload?.email });
  const isStudentExistsInUser = await User.findOne({ email: payload?.email });

  const hashedPassword = await bcrypt.hash(payload?.password, 8); 

  if (isStudentExistsInUser ) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exists');
  }

  if(isStudentExists){   
    const data = {
      otp ,
      password : hashedPassword,
      expiresAt : expirationTime
    }

    await TampUserCollection.findOneAndUpdate({email : payload?.email}, data , {new : true, runValidators : true})
    await sendEmail(payload?.email, otp);
    return
  }

  const newUserData = {
    email: payload?.email,
    password: hashedPassword,
    name: payload?.name,
    otp,
    expiresAt: expirationTime, 
  };

  await sendEmail(payload?.email, otp);
  await TampUserCollection.create(newUserData);
  return {
    success: true,
    message: 'OTP sent to your email. Please verify to complete registration.',
  };
};

const purchasePlan = async (payload: Partial<TUser>) => {
  const day = parseInt(payload.plan|| "0", 10);  

  const currentDate = new Date();
  const expiresDate = new Date(currentDate.setDate(currentDate.getDate() + day));

  const updateData = {
    $set: {
      plan: payload.plan,
      price: payload.price,
      userType: payload.userType,
      expiresDate,
      orderID : payload.orderID || "" ,
      payerID : payload.payerID || "",
    },
  };
  const result = await User.findOneAndUpdate(
    { email: payload.email },
    updateData,
    { new: true, runValidators: true }
  );
  return result;
};

const verifyOTPintoDB = async (email: string, otp: string) => {
  const tempUser = await TampUserCollection.findOne({ email });
  
  if (!tempUser) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User not found. Try again');
  }

  if (tempUser.otp !== otp) {    
    throw new AppError(400, 'OTP not matched, try again');
  }
  
  if (new Date() > tempUser.expiresAt) {
    throw new AppError(400, 'OTP has expired, please request a new one');
  }

  const lastDocument = await User.findOne().sort({ _id: -1 }).exec();
  const lastDocumentId = lastDocument?.Id || 0;

  const newUserData = {
    Id: lastDocumentId + 1,
    email: tempUser.email,
    password: tempUser.password,
    name: tempUser.name,
  };

  await User.create(newUserData);
  await TampUserCollection.deleteOne({ email });

  return {
    success: true,
    message: 'User registered successfully!',
  };
};

const loginUserIntoDB = async (paylod: TLoginUser) => {  
  const userData = await User.findOne({email : paylod.email});

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is not found');
  }
    const res = await bcrypt.compare(paylod.password, userData.password)
  if(!res){
    throw new AppError(httpStatus.FORBIDDEN, 'password is not matched');
  }

  const jwtPayload = {
    email: userData.email,
    name: userData.name ,
    userType : userData.userType,
    expiresDate : userData.expiresDate,
    createdAt : userData.createdAt
  };
  
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );
  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {  
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorize!');
  }
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);
  const { email } = decoded;

  const userData = await User.findOne({email});

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is not found');
  }

  const jwtPayload = {
    email: userData.email,
    name: userData.name ,
    userType : userData.userType,
    expiresDate : userData.expiresDate,
    createdAt : userData.createdAt
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

const deleteExpiredUsers = async () => {
    try {
    const now = new Date();    
    const expiredUsers = await TampUserCollection.find({ expiresAt: { $lte: now } });

    if (expiredUsers.length > 0) {
      console.log("deleted");      
      await TampUserCollection.deleteMany({ expiresAt: { $lte: now } });
    } else {
      console.log("No expired users found");
    }
  } catch (error) {
    console.error("Error deleting expired users:", error);
    throw new AppError(500, "Failed to delete expired users");
  }
};


setInterval(() => {
  deleteExpiredUsers();
}, 30 * 60 * 1000);

  export const UserServices = {
    getSingleUserFromDB,
    updateAudionInfoIntoDB,
    createUserIntoDB,
    verifyOTPintoDB,
    loginUserIntoDB,
    purchasePlan,
    refreshToken
  };