import express from 'express';
import { articleController } from '../controllers/articles.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/authorization.middleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize);

router.get('/', articleController.getArticles);
router.post('/', articleController.postArticles);
router.get('/:articleId', articleController.getArticleById);
router.put('/:articleId', articleController.putArticleById);
router.delete('/:articleId', articleController.deleteArticleById);

export default router;
