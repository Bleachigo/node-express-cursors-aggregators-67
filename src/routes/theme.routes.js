import express from 'express';
import { themeController } from '../controllers/theme.controller.js';

const router = express.Router();

router.post('/', themeController.setTheme);

export default router;
