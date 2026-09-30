import { balloonsService } from '../services/balloons.service.js';
import { AppError } from '../utils/AppError.js';

export const balloonsController = {
  async postBalloons(req, res, next) {
    try {
      const balloons = req.body;

      const balloonsToInsert = await balloonsService.createBalloons(balloons);

      res.status(201).json(balloonsToInsert);
    } catch (error) {
      next(error);
    }
  },

  async patchBalloonById(req, res, next) {
    try {
      const { balloonId } = req.params;

      const updatedBalloon = await balloonsService.updateOneBalloon(
        balloonId,
        req.body,
      );

      res.status(200).json(updatedBalloon);
    } catch (error) {
      next(error);
    }
  },

  async patchBalloons(req, res, next) {
    try {
      const { color, shape } = req.query;

      if (typeof color !== 'string' || !color) {
        throw new AppError('Query param "color" is required', 400);
      }

      if (typeof shape !== 'string' || !shape) {
        throw new AppError('Query param "shape" is required', 400);
      }
      const query = { color, shape };
      const { color: changeColor } = req.body;
      const changes = { color: changeColor };

      if (typeof changeColor !== 'string' || !changeColor) {
        throw new AppError('Body param "color" is required', 400);
      }

      const result = await balloonsService.updateManyBalloons(query, changes);

      res.status(200).json({
        matched: result.matchedCount,
        modified: result.modifiedCount,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteBalloons(req, res, next) {
    try {
      const { color, shape } = req.query;

      if (typeof color !== 'string' || !color) {
        throw new AppError('Query param "color" is required', 400);
      }

      if (typeof shape !== 'string' || !shape) {
        throw new AppError('Query param "shape" is required', 400);
      }
      const query = { color, shape };
      const result = await balloonsService.updateManyBalloons(query);

      res.status(200).json({
        matched: result.deletedCount,
      });
    } catch (error) {
      next(error);
    }
  },
};
