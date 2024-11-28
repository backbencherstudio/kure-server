/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { AppError } from "../../errors/AppErrors";
import bcrypt from 'bcrypt'; 
import config from "../../config";
import { TampUserCollection, User } from "./user.model";
import { TLoginUser, TUser } from "./user.interface";
import { sendEmail } from "../../utils/sendEmail";
import { createToken, verifyToken } from "./user.utils";
import { sendEmailToUser } from "../../utils/sendEmailToUser";

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

const getAllUserFromDB = async (payload: string): Promise<any[]> => { 
  if (payload === "all") {
    const result = await User.find();
    return result;
  }
  if (payload === "inactive") {
    const date = new Date(); 
    const result2 = await User.find({isDeleted : false});
    const filterData = result2.filter(item => {
      const createdAtDate = new Date(item.createdAt as Date); 
      const timeDifferenceInDays = Math.floor((date.getTime() - createdAtDate.getTime()) / (1000 * 60 * 60 * 24));
      return typeof item.selfId === 'number' && timeDifferenceInDays > item.selfId;
    });

    return filterData;
  }
  const isSubscribeUser = payload === "nonSubscriber";
  const result = await User.find({ isDeleted: isSubscribeUser });
  return result;
};

const getSingleUserFromDB = async (email : string) =>{  
  const result = await User.findOne({email})
  return result
}

const updateAudionInfoIntoDB = async (payload: Partial<TUser>): Promise<TUser | null> => {  
  try {
    const userData = await User.findOne({ email: payload?.email });
    if (!userData) {
      throw new AppError(404, "User not found");
    }
    const result = await User.findOneAndUpdate(
      { email: payload.email },
      { selfId: (userData?.selfId || 0) + 1 },
      { new: true, runValidators: true }
    );

    return result;
  } catch (error) {
    console.error("Error updating audio info:", error);
    throw new AppError(500, "Failed to update audio information");
  }
};

const logOutUpdateIntoDB = async ( email : string )=>{
  const payload = {
    selectedBodyAudios : [],
    selectedMindAudios : [],
    selectedEgoAudios : [],
    selectedSelfAudios : []
  }
  const result = await User.findOneAndUpdate(
    { email },
    payload,
    { new: true, runValidators: true }
  );
  return result;
}

const createUserIntoDB = async (payload: TUser) => {  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expirationTime = new Date(Date.now() + 2 * 60 * 1000);

  const isStudentExists = await TampUserCollection.findOne({ email: payload?.email });
  const isStudentExistsInUser = await User.findOne({ email: payload?.email });

  const hashedPassword = await bcrypt.hash(payload?.password, 8);   

  if (isStudentExistsInUser ) {
    throw new AppError(400, 'User already exists');
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

const resetPasswordIntoDB = async (payload : any )=>{
  const isUserExistsInUser = await User.findOne({ email: payload?.email });
  if(!isUserExistsInUser){
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
  }
  const hashedPassword = await bcrypt.hash(payload?.password, 8);
  const result = await User.findOneAndUpdate({email : payload.email}, {password : hashedPassword}, {new : true, runValidators : true})
  return result  
}

const setSelectedAudioIntoDB = async(payload : any )=>{
  const isExists = await User.findOne({email : payload?.email})
  if(!isExists){
    throw new AppError(404, "user not found");
  }

  const updateData = {
    selectedBodyAudios : payload.idArray
  }  
  const result = await User.findOneAndUpdate({email : payload.email}, updateData, {new : true, runValidators : true} )
  return result
  
}

const purchasePlan = async (payload: Partial<TUser>) => {  
  const userData = await User.findOne({email : payload?.email});  
  
  if(userData?.sessionId !== payload.sessionId ){
    const  updateData = {
      $set: {
        selectedBodyAudios : [],
        selectedMindAudios : [],
        selectedEgoAudios : [],
        selectedSelfAudios : [],
        sessionId : payload.sessionId || "",
        isDeleted : false
      },
    };
    const result = await User.findOneAndUpdate(
      { email: payload.email },
      updateData,
      { new: true, runValidators: true }
    );
    return result;
  }
  else{
    const  updateData = {
      $set: {
        sessionId : payload.sessionId || "",
      },
    };
    const result = await User.findOneAndUpdate(
      { email: payload.email },
      updateData,
      { new: true, runValidators: true }
    );
    return result;    
  }
};

const userDeleteIntoDB = async ( payload : any ) =>{  
    const isUserExists = await User.findOne({email : payload});
    if(!isUserExists){
      throw new AppError(httpStatus.BAD_REQUEST, "User not Found")
    }
    const result = await User.findOneAndUpdate({email : payload}, { isDeleted : true }, {new : true, runValidators : true})
    return result    
}

const verifyOTPintoDB = async (email: string, otp: string, userType: any) => {
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
    userType
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
    sessionId : userData. sessionId,
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

const sendEmailToAllUser = async (payload : any) =>{
  const { email, subject, value, filePath } = payload;
  const result = await sendEmailToUser(email, subject, value, filePath)
  return result;
}


setInterval(() => {
  deleteExpiredUsers();
}, 24 * 60 * 60 * 1000);

  export const UserServices = {
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