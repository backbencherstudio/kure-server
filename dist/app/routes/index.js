"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = require("../Modules/User/user.route");
const payment_route_1 = require("../Modules/payment/payment.route");
const router = express_1.default.Router();
const moduleRoutes = [
    { path: '/auth', route: user_route_1.UserRouter },
    { path: '/payment', route: payment_route_1.PaymentRouter },
];
moduleRoutes.forEach((pathRouter) => router.use(pathRouter.path, pathRouter.route));
exports.default = router;
