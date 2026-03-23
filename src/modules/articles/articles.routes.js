import express from 'express';
import * as controller from './articles.controller.js';

const router = express.Router();

router.get('/articles', controller.getAllArticlesWithPagination);
router.get('/articles/invalid-image', controller.getArticlesWithoutProperImage);
router.get('/articles/category/group', controller.getArticlesByCategoryAndGroup);
router.get('/articles/category', controller.getArticlesByCategory);
router.get('/article/:naziv', controller.getSingleArticle);
router.get('/article', controller.getArticle);

export default router;
