import express from 'express';
import { userController } from '../controllers/users.controller.js';
import { basicAuth } from '../middleware/auth.middleware.js';
import { validateUserInput } from '../middleware/validate.middleware.js';

const router = express.Router();

router.use(basicAuth);

router.get('/', userController.getUsers);
router.post('/', validateUserInput, userController.postUsers);
router.get('/:userId', userController.getUserById);
router.put('/:userId', validateUserInput, userController.putUserById);
router.patch('/:userId', userController.patchUserById);
router.delete('/:userId', userController.deleteUserById);

export default router;
