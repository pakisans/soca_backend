import * as ArticleModel from '../models/articleModel.js';

export async function getAllArticles(req, res) {
  try {
    const articles = await ArticleModel.getArticles();
    const response = {
      count: articles.length,
      articles: articles,
    };
    res.json(response);
    console.log(articles);
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
