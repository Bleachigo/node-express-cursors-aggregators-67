import express from 'express';
import ejs from 'ejs';
import pug from 'pug';
import cookieParser from 'cookie-parser';
import rootRoutes from './src/routes/root.routes.js';
import userRoutes from './src/routes/user.routes.js';
import articleRoutes from './src/routes/article.routes.js';
import { logRequest } from './src/middleware/logger.middleware.js';
import { notFound } from './src/middleware/not-found.middleware.js';
import { errorHandler } from './src/middleware/error.middleware.js';
import { resTextFormat } from './src/middleware/res-text-format.middleware.js';
import session from 'express-session';
import path from 'node:path';

export const app = express();

app.set('views', './src/views');

app.engine('ejs', ejs.__express);
app.engine('pug', pug.__express);

app.use(logRequest);
app.use(resTextFormat);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'student-project-local-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    },
  }),
);
app.use(cookieParser());
app.use(express.static(path.join(import.meta.dirname, './public')));
app.use('/', rootRoutes);
app.use('/users', userRoutes);
app.use('/articles', articleRoutes);
app.use(notFound);
app.use(errorHandler);
