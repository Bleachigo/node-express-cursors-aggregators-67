import express from 'express';
import { themeController } from '../controllers/theme.controller.js';

export const themeRouter = express.Router();

themeRouter.post('/', themeController.setTheme);
