import { logger } from '../config/logger.js';
import * as ArticleModel from '../models/articleModel.js';

export async function getArticlesWithoutProperImage(req, res) {
  try {
    const articles = await ArticleModel.getArticlesWithInvalidImage();
    const response = {
      count: articles.length,
      articles: articles,
    };
    res.json(response);
  } catch (error) {
    res.status(500).send({
      message: 'Error fetching articles with invalid images',
      error: error.message,
    });
  }
}

export async function getArticlesByCategoryAndGroup(req, res) {
  try {
    let { kategorija, grupa, page = 1, limit = 20 } = req.query;
    kategorija = decodeURIComponent(kategorija || '')
      .toLowerCase()
      .replace(/-/g, ' ');
    grupa = decodeURIComponent(grupa || '')
      .toLowerCase()
      .replace(/-/g, ' ');

    if (kategorija === 'mka mali kućni aparati') {
      kategorija = 'mka-mali kućni aparati';
    }

    const articles = await ArticleModel.getArticlesByCategoryAndGroup({
      categoryName: kategorija,
      groupName: grupa,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    const totalArticles = await ArticleModel.getTotalArticlesCount({
      categoryName: kategorija,
      groupName: grupa,
    });

    const response = {
      count: totalArticles,
      articles: articles,
      totalPages: Math.ceil(totalArticles / limit),
      currentPage: page,
    };

    res.json(response);
  } catch (error) {
    console.error('Error in getArticlesByCategory:', error);
    res.status(500).send({
      message: 'Error fetching articles by category',
      error: error.message,
    });
  }
}

export async function getArticlesByCategory(req, res) {
  try {
    let { kategorija, page = 1, limit = 20 } = req.query;
    kategorija = decodeURIComponent(kategorija || '')
      .toLowerCase()
      .replace(/-/g, ' ');

    if (kategorija === 'mka mali kućni aparati') {
      kategorija = 'mka-mali kućni aparati';
    }

    const articles = await ArticleModel.getArticlesByCategory({
      categoryName: kategorija,
      groupName: grupa,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    const totalArticles = await ArticleModel.getTotalArticlesCount({
      categoryName: kategorija,
      groupName: grupa,
    });

    const response = {
      count: totalArticles,
      articles: articles,
      totalPages: Math.ceil(totalArticles / limit),
      currentPage: page,
    };

    res.json(response);
  } catch (error) {
    console.error('Error in getArticlesByCategory:', error);
    res.status(500).send({
      message: 'Error fetching articles by category',
      error: error.message,
    });
  }
}

export async function getSingleArticle(req, res) {
  try {
    const naziv = decodeURIComponent(req.params.naziv)
      .replace(/-/g, '-')
      .toLowerCase();
    const article = await ArticleModel.getArticleByName(naziv);
    if (article) {
      res.json(article);
    } else {
      res.status(404).send('Article not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function getArticle(req, res) {
  console.log('IDkurac', req.query.id);
  try {
    const article = await ArticleModel.getArticleById(req.query.id);
    if (article) {
      res.json(article);
    } else {
      res.status(404).send('Article not found');
    }
  } catch (error) {
    console.log('IDkurac', req.query.id);
    res.status(500).send(error.message);
  }
}

export async function getAllArticlesWithPagination(req, res) {
  try {
    let { page = 1, limit = 20, search = '' } = req.query;
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res
        .status(400)
        .json({ message: 'Invalid page or limit parameters' });
    }

    const { articles, total } = await ArticleModel.getAllArticles({
      page,
      limit,
      search,
    });

    const response = {
      count: total,
      articles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).send({
      message: 'Error fetching articles',
      error: error.message,
    });
  }
}
