import { model, Schema } from "mongoose";
import bcrypt from 'bcrypt';
import { TampUser, TUser } from "./user.interface";


const TampUserSchema = new Schema<TampUser>(
  {
    id: {
      type: String,
    },
    otp: {
      type: String,
      required: [true, "Otp is required"],
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
      default : ""
    },
    price: {
      type: String,
      default : ""
    },
    userType: {
      type: String,
      default : ""
    },
    expiresDate: {
      type: Date,
    },
    orderID : { type : Number },
    payerID : { type : Number },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);



const userSchema = new Schema<TUser>(
  {
    id: {
      type: String,
    },
    Id: {
      type: Number,
      required: [true, "Id is required"],
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
      default : ""
    },
    price: {
      type: String,
      default : ""
    },
    userType: {
      type: String,
      default : ""
    },
    orderID : { type : String, default : "" },
    payerID : { type : String, default : "" },
    expiresDate: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);




userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashPassword,
) {
  return await bcrypt.compare(plainTextPassword, hashPassword);
};



export const TampUserCollection = model<TUser>('TampUser', TampUserSchema);

export const User = model<TUser>('User', userSchema);
