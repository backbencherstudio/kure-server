/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppError } from '../../errors/AppErrors';
import httpStatus from 'http-status';
import { TLoginUser, TUser } from './user.interface';
import { User, UserEmail } from './user.model';
import config from '../../config';
import { createToken } from './user.utils';

const createUserIntoDB = async (payload: TUser) => {
  const isStudentExists = await User.findOne({ email: payload.email });
  if (isStudentExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exists');
  }
  const result = await User.create(payload);
  return result;
};



const loginUserIntoDB = async (paylod: TLoginUser) => {  
  const userData = await User.isUserExistsByCustomeId(paylod.email);
  
  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User is not found');
  }
  if (!(await User.isPasswordMatched(paylod?.password, userData?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, 'password is not matched');
  }
  
  const jwtPayload = {
    email: userData.email
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


const createUserEmailIntoDB = async (payload: TUser) => {
  const isStudentExists = await UserEmail.findOne({ email: payload.email });
  if (isStudentExists) {
    throw new AppError(httpStatus.BAD_REQUEST, 'User already exists');
  }
  const result = await UserEmail.create(payload);
  return result;
};


export const UserServices = {
  createUserIntoDB,
  loginUserIntoDB,
  createUserEmailIntoDB
};
