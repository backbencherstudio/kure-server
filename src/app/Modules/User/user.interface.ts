/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

// ======================================>>>>>>>> Register Interface

export interface TUser {
  id: string;
  Id : number; 
  selfId ?: string;
  egoId ?: string;
  miendId ?: string;
  bodyId ?: string;
  category ?: string;
  otp: string;
  name: string;
  email: string;
  password: string;
  isDeleted: boolean;
  expiresAt : Date;
  plan ?: string;
  price ?: string;
  userType ?: string;
  expiresDate ?: Date;
  orderID ?: string ;
  payerID ?: string ;
  createdAt : Date
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


export interface TampUser extends TUser {} 