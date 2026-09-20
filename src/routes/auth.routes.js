import express from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateUserInput } from '../middleware/index.js';
import passport from 'passport';
import { requireAuth } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/AppError.js';

export const authRouter = express.Router();

authRouter.post('/register', validateUserInput, authController.registerUser);
authRouter.post(
  '/login',
  validateUserInput,
  (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err);
      if (!user)
        return next(
          new AppError(info?.message ?? 'Invalid email or password', 401),
        );
      req.logIn(user, (loginErr) =>
        loginErr
          ? next(loginErr)
          : res.json({
              message: 'Login successful',
              user: { id: user.id, email: user.email },
            }),
      );
    })(req, res, next);
  },
  authController.loginUser,
);
authRouter.post('/logout', requireAuth, authController.logout);
authRouter.get('/me', requireAuth, authController.me);
