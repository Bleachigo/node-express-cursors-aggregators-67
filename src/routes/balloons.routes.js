import express from 'express';
import { balloonsController } from '../controllers/balloons.controller.js';

export const balloonsRouter = express.Router();

balloonsRouter.post('/', balloonsController.postBalloons);
balloonsRouter.patch('/:balloonId', balloonsController.patchBalloonById);
balloonsRouter.patch('/', balloonsController.patchBalloons);
