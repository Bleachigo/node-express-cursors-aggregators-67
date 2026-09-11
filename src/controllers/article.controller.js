import { articleService } from '../services/article.service.js';

export const articleController = {
  async getArticles(req, res, next) {
    try {
      const articles = await articleService.getAllArticles();

      res.type('html');
      res.render('../views/articles/index.ejs', { articles });
    } catch (error) {
      next(error);
    }
  },
  postArticles(req, res) {
    res.send('Post articles route');
  },
  async getArticleById(req, res, next) {
    try {
      const { articleId } = req.params;

      const article = await articleService.findArticleById(articleId);

      res.type('html');
      res.render('../views/articles/details.ejs', { article });
    } catch (error) {
      next(error);
    }
  },
  putArticleById(req, res) {
    res.send(`Put article by Id route: ${req.params.articleId}`);
  },
  deleteArticleById(req, res) {
    res.send(`Delete article by Id route: ${req.params.articleId}`);
  },
};
