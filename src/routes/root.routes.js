import express from 'express';
import { rootController } from '../controllers/root.controller.js';

const router = express.Router();

router.get('/', rootController.getRoot);

export default router;
