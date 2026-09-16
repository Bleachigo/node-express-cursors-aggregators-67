import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { usersRepository } from '../repositories/users.repository.js';
import { verifyPassword } from '../utils/password';

passport.use(
  new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }),

  async (email, password, done) => {
    try {
      const user = await usersRepository.findByEmail(email);

      if (!user) {
        return done(null, false, {
          message: 'Invalid email or password',
        });
      }

      const passwordMatches = verifyPassword(password, user.password);

      if (!passwordMatches) {
        return done(null, false, {
          message: 'Invalid email or password',
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  },
);
