import express from 'express';
import { balloonsController } from '../controllers/balloons.controller.js';

export const balloonsRouter = express.Router();

balloonsRouter.get('/stats', balloonsController.getStats);
balloonsRouter.post('/', balloonsController.postBalloons);
balloonsRouter.patch('/:balloonId', balloonsController.patchBalloonById);
balloonsRouter.put('/:balloonId', balloonsController.putBalloonById);
balloonsRouter.delete('/:balloonId', balloonsController.deleteBalloonById);
balloonsRouter.patch('/', balloonsController.patchBalloons);
balloonsRouter.delete('/', balloonsController.deleteBalloons);
