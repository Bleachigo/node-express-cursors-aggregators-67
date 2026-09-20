import express from 'express';
import { articleController } from '../controllers/articles.controller.js';
import { requireAuth, authorize } from '../middleware/index.js';

export const articleRouter = express.Router();

articleRouter.use(requireAuth);
articleRouter.use(authorize);

articleRouter.get('/', articleController.getArticles);
articleRouter.post('/', articleController.postArticles);
articleRouter.get('/:articleId', articleController.getArticleById);
articleRouter.put('/:articleId', articleController.putArticleById);
articleRouter.delete('/:articleId', articleController.deleteArticleById);
