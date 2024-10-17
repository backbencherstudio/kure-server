import express from 'express';
import { userController } from './user.controller';

const router = express.Router();

router.post(
  '/create-user',
  userController.createUser,
);

router.post(
  '/login',
  userController.loginUser,
);

router.post(
  '/verifyOTP',
  userController.verifyOTP,
);


export const UserRouter = router;
