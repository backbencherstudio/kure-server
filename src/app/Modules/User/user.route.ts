import express from 'express';
import { userController } from './user.controller';
import { Auth } from '../../middleware/auth';

const router = express.Router();

router.get(
  '/',
  Auth(),
  userController.getSingleUser,
);

router.post(
  '/create-user',
  userController.createUser,
);

router.patch(
  '/purchasePlan',
  userController.purchasePlanController,
);

router.post(
  '/login',
  userController.loginUser,
);

router.post(
  '/verifyOTP',
  userController.verifyOTP,
);

router.post(
  '/refresh-token',
  userController.refreshToken,
);


export const UserRouter = router;
