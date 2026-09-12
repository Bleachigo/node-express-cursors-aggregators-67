import { AppError } from '../utils/AppError.js';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export const userService = {
  async getAllUsers() {
    const response = await fetch(`${BASE_URL}/users`);

    if (!response.ok) {
      throw new AppError('Failed to fetch users', 502);
    }

    return response.json();
  },

  async findUserById(userId) {
    const response = await fetch(`${BASE_URL}/users/${userId}`);

    if (response.status === 404) {
      throw new AppError('User not found', 404);
    }

    if (!response.ok) {
      throw new AppError('Failed to fetch user by id', 502);
    }

    return response.json();
  },
};
