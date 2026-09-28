import { AppError } from '../utils/AppError.js';
import { usersRepository } from '../repositories/users.repository.js';

export const userService = {
  async getAllUsers() {
    return await usersRepository.findAll();
  },

  async findUserById(userId) {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new AppError(`User ${userId} not found`, 404);
    }

    return user;
  },

  async updateUser(userId, userData) {
    const updatedUser = await usersRepository.update(userId, userData);

    if (!updatedUser) {
      throw new AppError(`User ${userId} not found`, 404);
    }

    return updatedUser;
  },

  async replaceUser(userId, userData) {
    const replacedUser = await usersRepository.replace(userId, userData);

    if (!replacedUser) {
      throw new AppError(`User ${userId} not found`, 404);
    }

    return replacedUser;
  },

  async deleteUser(userId) {
    const deletedUser = await usersRepository.delete(userId);

    if (!deletedUser) {
      throw new AppError(`User ${userId} does not exitst`, 404);
    }

    return deletedUser;
  },
};
