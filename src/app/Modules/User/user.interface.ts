/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

// ======================================>>>>>>>> Register Interface
export type TUserName = {
  firstName: string;
  lastName: string;
};

export interface TUser {
  id: string;
  email: string;
  password: string;
  name: TUserName;
  role: 'supperAdmin' | 'admin';
}

// ======================================>>>>>>>> Login Interface
export type TLoginUser = {
  email: string;
  password: string;
};

export interface UserModel extends Model<TUser> {
  isUserExistsByCustomeId(id: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashPassword: string,
  ): Promise<boolean>;
}
