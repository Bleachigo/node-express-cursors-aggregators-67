import { userService } from '../services/user.service.js';

export const userController = {
  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();

      res.type('html');
      res.render('../views/users/index.pug', { users });
    } catch (error) {
      next(error);
    }
  },
  postUsers(req, res) {
    res.send('Post users route');
  },
  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await userService.findUserById(userId);

      res.type('html');
      res.render('../views/users/details.pug', { user });
    } catch (error) {
      next(error);
    }
  },
  putUserById(req, res) {
    res.send(`Put user by Id route: ${req.params.userId}`);
  },
  deleteUserById(req, res) {
    res.send(`Delete user by Id route: ${req.params.userId}`);
  },
};
