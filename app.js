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
import {
  articleRouter,
  authRouter,
  rootRouter,
  themeRouter,
  usersRouter,
} from './src/routes/index.js';

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
app.use('/theme', themeRouter);
app.use('/', rootRouter);
app.use('/users', usersRouter);
app.use('/articles', articleRouter);

app.use(notFound);
app.use(errorHandler);
