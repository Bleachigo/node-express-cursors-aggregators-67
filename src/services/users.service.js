import { AppError } from '../utils/AppError.js';
import { usersRepository } from '../repositories/users.repository.js';

export const userService = {
  async writeUser() {},
  async getAllUsers() {
    return usersRepository.findAll();
  },

  async findUserById(userId) {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new AppError(`User ${userId} not found`, 404);
    }

    return user;
  },
};
