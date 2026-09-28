import express from 'express';
import { userController } from '../controllers/users.controller.js';
import {
  requireAuth,
  validateUserInput,
  authorize,
} from '../middleware/index.js';

export const usersRouter = express.Router();

usersRouter.use(requireAuth);

usersRouter.get('/', userController.getUsers);
usersRouter.post('/', validateUserInput, userController.postUsers);
usersRouter.get('/:userId', userController.getUserById);
usersRouter.put('/:userId', authorize('admin'), userController.putUserById);
usersRouter.patch('/:userId', authorize('admin'), userController.patchUserById);
usersRouter.delete(
  '/:userId',
  authorize('admin'),
  userController.deleteUserById,
);
