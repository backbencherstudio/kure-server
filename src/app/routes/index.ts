import express from 'express';
import { UserRouter } from '../Modules/User/user.route';
// import { productsRouter } from '../modules/Products/Products.routes';
// import { UserRouter } from '../modules/User/user.route';
const router = express.Router();

const moduleRoutes = [
  // { path: '/products', route: productsRouter },
  { path: '/auth', route: UserRouter },
];

moduleRoutes.forEach((pathRouter) =>
  router.use(pathRouter.path, pathRouter.route),
);

export default router;
