import { logger } from '../config/logger.js';
import * as ArticleModel from '../models/articleModel.js';

export async function getAllArticles(req, res) {
  try {
    const articles = await ArticleModel.getArticles();
    const response = {
      count: articles.length,
      articles: articles,
    };
    res.json(response);
  } catch (error) {
    res.status(500).send(error.message);
  }
}

export async function getSingleArticle(req, res) {
  try {
    const article = await ArticleModel.getArticle(req.params.id);
    if (article) {
      res.json(article);
    } else {
      res.status(404).send('Article not found');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
}

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

export async function getArticlesByCategory(req, res) {
  try {
    let { kategorija, grupa, page = 1, limit = 20 } = req.query;
    kategorija = decodeURIComponent(kategorija || '').toLowerCase();
    grupa = decodeURIComponent(grupa || '').toLowerCase();
    const articles = await ArticleModel.getArticlesByCategory({
      categoryName: kategorija.replace(/-/g, ' '),
      groupName: grupa.replace(/-/g, ' '),
      page: parseInt(page),
      limit: parseInt(limit),
    });

    const totalArticles = await ArticleModel.getTotalArticlesCount({
      categoryName: kategorija.replace(/-/g, ' '),
      groupName: grupa.replace(/-/g, ' '),
    });

    const response = {
      count: totalArticles,
      articles: articles,
      totalPages: Math.ceil(totalArticles / limit),
      currentPage: page,
    };

    res.json(response);
  } catch (error) {
    logger.error('Error in getAllArticles: ', error);
    res.status(500).send({
      message: 'Error fetching articles by category',
      error: error.message,
    });
  }
}
