import { balloonsService } from '../services/balloons.service.js';

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
};
