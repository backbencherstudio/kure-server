"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const zod_1 = require("zod");
const userCreateValidationNameSchema = zod_1.z.object({
    firstName: zod_1.z
        .string()
        .trim()
        .max(10, 'Name can not be more than 10 characters')
        .min(1, 'First name is required'),
    lastName: zod_1.z.string().trim().min(1, 'Last name is required'),
});
const createUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        user: zod_1.z.object({
            password: zod_1.z
                .string()
                .min(5, { message: 'password can not be less then 5 characters' })
                .max(10, { message: 'password can not be more than 10 characters' })
                .optional(),
            name: userCreateValidationNameSchema,
            email: zod_1.z
                .string()
                .email('Invalid email address')
                .min(1, 'Email is required'),
        }),
    }),
});
const loginValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: 'email is required' }),
        password: zod_1.z.string({ required_error: 'Password is required' }),
    }),
});
const emailValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        emailData: zod_1.z.object({
            email: zod_1.z.string({ required_error: 'email is required' }),
        })
    }),
});
exports.UserValidation = {
    createUserValidationSchema,
    loginValidationSchema,
    emailValidationSchema
};
