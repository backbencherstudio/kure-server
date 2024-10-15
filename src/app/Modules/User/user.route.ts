import express from 'express';
import { userController } from './user.controller';
import { UserValidation } from './user.validation';
import { validateRequest } from '../../middleware/validateRequest';

const router = express.Router();

router.post(
  '/create-user',
  validateRequest(UserValidation.createUserValidationSchema),
  userController.createUser,
);

router.post(
  '/login',
  validateRequest(UserValidation.loginValidationSchema),
  userController.loginUser,
);

router.post(
  '/storeEmail',
  validateRequest(UserValidation.emailValidationSchema),
  userController.createUserEmail,
);


export const UserRouter = router;
