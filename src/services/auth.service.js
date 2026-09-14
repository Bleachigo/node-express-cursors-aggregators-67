import { usersRepository } from '../repositories/users.repository.js';
import { AppError } from '../utils/AppError.js';
import { createToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

const toPublicUser = (user) => ({
  id: user.id,
  username: user.username,
  role: user.role,
});

export const authService = {
  async register(username, password) {
    const existingUser = await usersRepository.findByUsername(username);

    if (existingUser) {
      throw new AppError('Invalid username or password', 401);
    }

    const passwordHash = await hashPassword(password);

    const user = {
      id: crypto.randomUUID(),
      username,
      passwordHash,
      role: 'user',
    };

    await usersRepository.create(user);

    const token = createToken(user.id);

    return {
      user: toPublicUser(user),
      token,
    };
  },

  async login(username, password) {
    const user = await usersRepository.findByUsername(username);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid username or password', 401);
    }

    const token = createToken(user.id);

    return {
      user: toPublicUser(user),
      token,
    };
  },
};
