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

// router.get('/all-users', userController.gatAllUsers);
// router.patch('/all-users', userController.updateUserRole);
// router.delete('/all-users/:id', userController.deleteUser);

// router.post(
//   '/login',
//   validateRequest(UserValidation.loginValidationSchema),
//   userController.loginUser,
// );

// router.post(
//   '/refresh-token',
//   validateRequest(UserValidation.refreshTokenValidationSchema),
//   userController.refreshToken,
// );

export const UserRouter = router;
