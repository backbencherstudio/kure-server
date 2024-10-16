import express from 'express';
import { UserRouter } from '../Modules/User/user.route';
import { PaymentRouter } from '../Modules/payment/payment.route';
const router = express.Router();

const moduleRoutes = [
  { path: '/auth', route: UserRouter },
  { path: '/payment', route: PaymentRouter },
];

moduleRoutes.forEach((pathRouter) =>
  router.use(pathRouter.path, pathRouter.route),
);

export default router;
