import express from 'express';
import { rootController } from '../controllers/root.controller.js';

export const rootRouter = express.Router();

rootRouter.get('/', rootController.getRoot);
