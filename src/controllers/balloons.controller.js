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
      const { color: matchColor } = req.query;

      if (typeof matchColor !== 'string' || !matchColor) {
        throw new AppError('Query param "color" is required', 400);
      }

      const { color: changeColor } = req.body;

      if (typeof changeColor !== 'string' || !changeColor) {
        throw new AppError('Body param "color" is required', 400);
      }

      const result = await balloonsService.updateManyBalloons(
        matchColor,
        changeColor,
      );

      res.status(200).json({
        matched: result.matchedCount,
        modified: result.modifiedCount,
      });
    } catch (error) {
      next(error);
    }
  },
};
