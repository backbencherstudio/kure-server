import express from 'express';
import { userController } from './user.controller';
import { Auth } from '../../middleware/auth';

const router = express.Router();

router.get(
  '/',
  Auth(),
  userController.getAllUser,
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
  // validateRequest(AuthValidation.refreshTokenValidationSchema),
  userController.refreshToken,
);


export const UserRouter = router;
