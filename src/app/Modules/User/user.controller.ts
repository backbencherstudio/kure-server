import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { UserServices } from './user.service';
import config from '../../config';

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


export const userController = {
  createUser,
  loginUser,
};
