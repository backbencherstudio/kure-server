import express from 'express';
import { userController } from './user.controller';
import { Auth } from '../../middleware/auth';

const router = express.Router();

router.get(
  '/allUsers',
  userController.getAllUser,
);

router.get(
  '/',
  Auth(),
  userController.getSingleUser,
);

router.patch(
  '/audio',
  userController.updateAudio,
);

router.post(
  '/create-user',
  userController.createUser,
);

router.patch(
  '/resetPassword',
  userController.resetPassword,
);

router.patch(
  '/log-out-update',
  userController.logOutUpdate,
);

router.patch(
  '/purchasePlan',
  userController.purchasePlanController,
);

router.post(
  '/login',
  userController.loginUser,
);

router.patch(
  '/userDelete',
  userController.userDelete,
);

router.post(
  '/verifyOTP',
  userController.verifyOTP,
);

router.post(
  '/refresh-token',
  userController.refreshToken,
);

router.post(
  '/sendEmail',
  userController.sendEmailToUser,
);

router.patch(
  '/selectedAudio',
  userController.setSelectedAudio,
);


export const UserRouter = router;
