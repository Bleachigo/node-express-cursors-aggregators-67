import express from 'express';
import { userController } from '../controllers/users.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateUserInput } from '../middleware/validate.middleware.js';
import { authorize } from '../middleware/authorization.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', userController.getUsers);
router.post('/', validateUserInput, userController.postUsers);
router.get('/:userId', userController.getUserById);
router.put(
  '/:userId',
  authorize,
  validateUserInput,
  userController.putUserById,
);
router.patch(
  '/:userId',
  authorize,
  validateUserInput,
  userController.patchUserById,
);
router.delete('/:userId', userController.deleteUserById);

export default router;
