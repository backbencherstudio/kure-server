import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { UserServices } from './user.service';
import config from '../../config';

const getAllUser = catchAsync(async (req, res) => {
  const status = req.query.status
  const result = await UserServices.getAllUserFromDB(status as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get all users',
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await UserServices.getSingleUserFromDB(req?.query?.email as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'get single user',
    data: result,
  });
});

const updateAudio = catchAsync(async (req, res) => {
  const { audioData } = req.body;
  const result = await UserServices.updateAudionInfoIntoDB(audioData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audion status Update successFully',
    data: result,
  });
});

const createUser = catchAsync(async (req, res) => {
  const { user: userData } = req.body;
  const result = await UserServices.createUserIntoDB(userData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Registered successFully',
    data: result,
  });
});

const setSelectedAudio = catchAsync(async (req, res) => {
  const { data } = req.body;  
  const result = await UserServices.setSelectedAudioIntoDB(data);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Audio Selected successFully',
    data: result,
  });
});

const purchasePlanController = catchAsync(async (req, res) => {
  const { purchasePlan: updateData } = req.body;
  const result = await UserServices.purchasePlan(updateData);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Purchase successFully',
    data: result,
  });
});


const loginUser = catchAsync(async (req, res) => {
  const result = await UserServices.loginUserIntoDB(req.body);
  const { refreshToken, accessToken } = result;
  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'development',
    httpOnly: true,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User is loged in successfully',
    data: {
      accessToken,
    },
  });
});


const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await UserServices.refreshToken(refreshToken);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access is token retrived successfully',
    data: result,
  });
});


const userDelete = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await UserServices.userDeleteIntoDB(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Delete successFully',
    data: result,
  });
});

const verifyOTP = catchAsync(async (req, res) => {
  const { email, otp, userType } = req.body;
  const result = await UserServices.verifyOTPintoDB(email, otp, userType);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Registered successFully',
    data: result,
  });
});


const logOutUpdate = catchAsync(async (req, res) => {
  const { email } = req.body;
  const result = await UserServices.logOutUpdateIntoDB(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Log Out successFully',
    data: result,
  });
});

const sendEmailToUser = catchAsync(async (req, res) => {
  const result = await UserServices.sendEmailToAllUser(req.body);
 
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Email send  successfully',
    data: result,
  });
});



export const userController = {
  getAllUser,
  getSingleUser,
  updateAudio,
  createUser,
  loginUser,
  userDelete,
  verifyOTP,
  refreshToken,
  setSelectedAudio,
  purchasePlanController,
  logOutUpdate,
  sendEmailToUser
};
