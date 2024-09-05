import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
// import config from '../../config';
import { UserServices } from './user.service';

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

// const gatAllUsers = catchAsync(async (req, res) => {
//   const result = await UserServices.getAllUserFromDB();
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Get All Users successFully',
//     data: result,
//   });
// });

// const updateUserRole = catchAsync(async (req, res) => {
//   const { role, id } = req.body;
//   const result = await UserServices.updateUserRoleIntoDB(
//     id as string,
//     role as string,
//   );
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'User Role Update successFully',
//     data: result,
//   });
// });

// const loginUser = catchAsync(async (req, res) => {
//   const result = await UserServices.loginUserIntoDB(req.body);
//   const { refreshToken, accessToken } = result;
//   res.cookie('refreshToken', refreshToken, {
//     secure: config.NODE_ENV === 'production',
//     httpOnly: true,
//   });
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'User is loged in successfully',
//     data: {
//       accessToken,
//     },
//   });
// });

// const refreshToken = catchAsync(async (req, res) => {
//   const { refreshToken } = req.cookies;
//   const result = await UserServices.refreshToken(refreshToken);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'Access is token retrived successfully',
//     data: result,
//   });
// });

// const deleteUser = catchAsync(async (req, res) => {
//   const result = await UserServices.deleteUserFromDB(req?.params?.id);
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: 'User Delete Successfully',
//     data: result,
//   });
// });

export const userController = {
  createUser,
  // gatAllUsers,
  // updateUserRole,
  // loginUser,
  // refreshToken,
  // deleteUser,
};
