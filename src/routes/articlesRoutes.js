import express from 'express';
import * as ArticlesController from '../controllers/articlesController.js';

const router = express.Router();

router.get('/articles', ArticlesController.getAllArticles);
router.get('/article/:id', ArticlesController.getSingleArticle);
router.get(
  '/articles/invalid-image',
  ArticlesController.getArticlesWithoutProperImage,
);

export default router;
