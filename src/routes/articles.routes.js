import express from 'express';
import { articleController } from '../controllers/articles.controller.js';
import { requireAuth, authorize } from '../middleware/index.js';

export const articleRouter = express.Router();

articleRouter.use(requireAuth);

articleRouter.get('/', articleController.getArticles);
articleRouter.post('/', authorize('admin'), articleController.postArticles);
articleRouter.get('/:articleId', articleController.getArticleById);
articleRouter.put(
  '/:articleId',
  authorize('admin'),
  articleController.putArticleById,
);
articleRouter.delete(
  '/:articleId',
  authorize('admin'),
  articleController.deleteArticleById,
);
