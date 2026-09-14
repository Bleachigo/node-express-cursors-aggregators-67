import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/users.repository.js';
import { AppError } from '../utils/AppError.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userRepository.findById(payload.sub);

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
    next(error);
  }
};
