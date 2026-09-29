import { AppError } from '../utils/AppError.js';
import { balloonsRepository } from '../repositories/balloons.repository.js';

const SHAPES = ['round', 'heart', 'star'];
const MAX_BATCH = 100;

const toBalloonDoc = (item, index) => {
  const { color, shape, size } = item ?? {};

  if (typeof color !== 'string' || !color.trim()) {
    throw new AppError(`Item ${index}: color must be a non empty string`, 400);
  }

  if (!SHAPES.includes(shape)) {
    throw new AppError(
      `Item ${index}: shape must be one of ${SHAPES.join(', ')}`,
      400,
    );
  }

  if (!Number.isInteger(size) || size <= 0) {
    throw new AppError(`Item ${index}: size must be a positive integer`, 400);
  }

  return {
    color: color.trim().toLowerCase(),
    shape,
    size,
    createdAt: new Date(),
  };
};

const toFilter = (query = {}) => {
  const filter = {};

  if (query.color !== undefined)
    filter.color = String(query.color).trim().toLowerCase();

  if (query.shape !== undefined) {
    if (!SHAPES.includes(query.shape)) {
      throw new AppError(`shape must be one of ${SHAPES.join(', ')}`, 400);
    }
    filter.shape = query.shape;
  }

  if (!Object.keys(filter).length) {
    throw new AppError('Filter by color and/or shape is required', 400);
  }

  return filter;
};

export const balloonsService = {
  async createBalloons(items) {
    if (!Array.isArray(items) || !items.length || items.length > MAX_BATCH) {
      throw new AppError(
        `Body must be an array of 1-${MAX_BATCH} balloons`,
        400,
      );
    }

    return balloonsRepository.createMany(items.map(toBalloonDoc));
  },

  async updateOneBalloon(balloonId, updates) {
    const result = await balloonsRepository.updateBalloon(balloonId, updates);

    if (!result?.matchedCount) {
      throw new AppError(`Balloon ${balloonId} not found`, 404);
    }

    const { matchedCount, modifiedCount } = result;

    return { matchedCount, modifiedCount };
  },
};
