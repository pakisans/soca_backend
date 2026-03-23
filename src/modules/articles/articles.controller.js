import * as service from './articles.service.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { AppError } from '../../errors/AppError.js';

export const getArticlesWithoutProperImage = asyncHandler(async (_req, res) => {
  const articles = await service.getArticlesWithInvalidImage();
  res.json({ count: articles.length, articles });
});

export const getSingleArticle = asyncHandler(async (req, res) => {
  const article = await service.getArticleByName(req.params.naziv);
  res.json(article);
});

export const getArticle = asyncHandler(async (req, res) => {
  const article = await service.getArticleById(req.query.id);
  res.json(article);
});

export const getArticlesByCategoryAndGroup = asyncHandler(async (req, res) => {
  const { kategorija, grupa, page = 1, limit = 20, sort, partner } = req.query;
  const result = await service.getArticlesByCategoryAndGroup({
    kategorija,
    grupa,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    partner,
  });
  res.json(result);
});

export const getArticlesByCategory = asyncHandler(async (req, res) => {
  const { kategorija, page = 1, limit = 20, sort, partner } = req.query;
  const result = await service.getArticlesByCategory({
    kategorija,
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    partner,
  });
  res.json(result);
});

export const getAllArticlesWithPagination = asyncHandler(async (req, res) => {
  let { page = 1, limit = 20, search = '', sort, partner = '' } = req.query;
  page = parseInt(page, 10);
  limit = parseInt(limit, 10);

  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    throw new AppError('Invalid page or limit parameters', 400);
  }

  const result = await service.getAllArticles({ page, limit, search, sort, partner });
  res.json(result);
});
