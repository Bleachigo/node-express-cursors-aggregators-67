export const themeMiddleware = (req, res, next) => {
  const { theme } = req.cookies;

  res.locals.theme = ['light', 'dark'].includes(theme) ? theme : 'light';

  next();
};
