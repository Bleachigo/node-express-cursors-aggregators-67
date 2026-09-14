import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateUserInput } from '../middleware/validate.middleware.js';

export const authRouter = express.Router();

authRouter.post('/register', validateUserInput, authController.registerUser);
authRouter.post('/login', validateUserInput, authController.loginUser);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authenticate, authController.me);
