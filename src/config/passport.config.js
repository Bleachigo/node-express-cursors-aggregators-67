import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { verifyPassword } from '../utils/password.js';
import { verifyCredentials } from '../services/auth.service.js';

passport.use(
  new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }),

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
);
