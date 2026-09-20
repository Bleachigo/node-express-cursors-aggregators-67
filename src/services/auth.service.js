import { usersRepository } from '../repositories/users.repository.js';
import { AppError } from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

const toPublicUser = (user) => ({
  id: user.id,
  email: user.email,
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
