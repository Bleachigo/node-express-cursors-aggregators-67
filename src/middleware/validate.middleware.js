import { AppError } from '../utils/AppError.js';

export const validateUserInput = (req, res, next) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== 'string' ||
    email.trim() === '' ||
    typeof password !== 'string' ||
    password.trim() === ''
  ) {
    return next(
      new AppError('Email and password must be non-empty strings', 400),
    );
  }

  next();
};
