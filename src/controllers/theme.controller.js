import { AppError } from '../utils/AppError.js';

export const themeController = {
  setTheme(req, res, next) {
    const { theme } = req.body;

    if (!['light', 'dark'].includes(theme)) {
      return next(new AppError('Invalid theme', 400));
    }

    res.cookie('theme', theme, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });

    res.status(200).json({
      message: 'Theme saved',
      theme,
    });
  },
};
