import passport from '../config/passport.config.js';
import { AppError } from '../utils/AppError.js';

export const authenticateLocal = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return next(
        new AppError(info?.message ?? 'Invalid email or password', 401),
      );
    }

    req.logIn(user, (logingErr) => (logingErr ? next(logingErr) : next()));
  })(req, res, next);
};

export const requireAuth = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next(new AppError('Unauthorized', 401));
  }

  next();
};
