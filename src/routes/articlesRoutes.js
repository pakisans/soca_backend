import express from 'express';
import * as ArticlesController from '../controllers/articlesController.js';

const router = express.Router();

router.get('/articles', ArticlesController.getAllArticlesWithPagination);
router.get(
  '/articles/invalid-image',
  ArticlesController.getArticlesWithoutProperImage,
);
router.get(
  '/articles/category/group',
  ArticlesController.getArticlesByCategoryAndGroup,
);
router.get('/articles/category', ArticlesController.getArticlesByCategory);
router.get('/article/:naziv', ArticlesController.getSingleArticle);
router.get('/article', ArticlesController.getArticle);

export default router;
