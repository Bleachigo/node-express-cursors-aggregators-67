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
  async register(email, password) {
    const existingUser = await usersRepository.findByEmail(email);

    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    const passwordHash = await hashPassword(password);

    const user = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      role: 'user',
    };

    await usersRepository.create(user);

    return {
      user: toPublicUser(user),
      role: user.role,
    };
  },

  async login(username, password) {
    const user = await usersRepository.findByUsername(username);

    if (!user) {
      throw new AppError('Invalid username or password', 401);
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

export const verifyCredentials = async (email, password) => {
  const user = await usersRepository.findByEmail(email);

  if (!user) return null;

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) return null;

  return user;
};
