import { userService } from '../services/users.service.js';

export const userController = {
  async postUsers(req, res, next) {
    res.send(`Post user by id: ${req.params.userId}`);
  },

  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();

      res.type('html');
      res.render('../views/users/index.pug', { users });
    } catch (error) {
      next(error);
    }
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

  async patchUserById(req, res, next) {
    try {
      const { userId } = req.params;

      const updatedUser = await userService.updateUser(userId, req.body);

      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  },

  deleteUserById(req, res) {
    res.send(`Delete user by Id route: ${req.params.userId}`);
  },
};
