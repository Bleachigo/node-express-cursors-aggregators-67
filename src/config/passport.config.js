import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { verifyCredentials } from '../services/auth.service.js';
import { usersRepository } from '../repositories/users.repository.js';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },

    async (email, password, done) => {
      try {
        const user = await verifyCredentials(email, password);

        if (!user) {
          return done(null, false, {
            message: 'Invalid email or password',
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await usersRepository.findById(id);

    if (!user) return done(null, false);

    return done(null, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    return done(error);
  }
});

export default passport;
