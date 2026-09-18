import { usersRepository } from '../repositories/users.repository.js';
import { AppError } from '../utils/AppError.js';
import { verifyToken } from '../utils/jwt.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const payload = verifyToken(token);

    const user = await usersRepository.findById(payload.sub);

    if (!user) {
      throw new AppError('User not found', 401);
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return next(new AppError('Invalid or expired token', 401));
    }

    next(error);
  }
};

export const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next(new AppError('Unauthorized', 401));
  }

  next();
};
