import cookieParser from 'cookie-parser';
import ejs from 'ejs';
import express from 'express';
import session from 'express-session';
import path from 'node:path';
import pug from 'pug';
import {
  errorHandler,
  logRequest,
  notFound,
  resTextFormat,
  themeMiddleware,
} from './src/middleware/index.js';
import articleRoutes from './src/routes/articles.routes.js';
import { authRouter } from './src/routes/auth.routes.js';
import rootRoutes from './src/routes/root.routes.js';
import themeRoutes from './src/routes/theme.routes.js';
import userRoutes from './src/routes/users.routes.js';

export const app = express();

app.set('views', './src/views');

app.engine('ejs', ejs.__express);
app.engine('pug', pug.__express);

app.use(logRequest);
app.use(express.static(path.join(import.meta.dirname, './public')));
app.use(resTextFormat);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    },
  }),
);
app.use(themeMiddleware);
app.use('/auth', authRouter);
app.use('/theme', themeRoutes);
app.use('/', rootRoutes);
app.use('/users', userRoutes);
app.use('/articles', articleRoutes);

app.use(notFound);
app.use(errorHandler);
