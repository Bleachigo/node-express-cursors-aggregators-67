export const authController = {
  async registerUser(req, res, next) {
    try {
      const { username, password } = req.body;

      const { user, token } = await authService.register(username, password);

      res.cookie('accessToken', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000,
      });

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  },

  async loginUser(req, res, next) {
    try {
      const { username, password } = req.body;

      const { user, token } = await authService.login(username, password);

      res.cookie('accessToken', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 1000,
      });

      res.status(201).json({ user });
    } catch (error) {
      next(error);
    }
  },

  async me(req, res, next) {
    res.json({ user: req.user });
  },

  async logout(req, res) {
    res.clearCookie('accessToken');
  },
};
