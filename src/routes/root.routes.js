import express from 'express';
import { rootController } from '../controllers/root.controller.js';

export const rooRouter = express.Router();

rooRouter.get('/', rootController.getRoot);
