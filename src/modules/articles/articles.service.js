import * as repo from './articles.repository.js';
import { withImageUrl } from '../../utils/articleHelpers.js';
import { AppError } from '../../errors/AppError.js';

function normalizeKategorija(raw) {
  let kategorija = decodeURIComponent(raw || '')
    .toLowerCase()
    .replace(/-/g, ' ');

  if (kategorija === 'mka mali kućni aparati') {
    kategorija = 'mka-mali kućni aparati';
  }

  return kategorija;
}

function buildPaginatedResponse(articles, total, page, limit) {
  return {
    count: total,
    articles,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

export async function getArticlesWithInvalidImage() {
  return repo.findArticlesWithInvalidImage();
}

export async function getArticleByName(rawNaziv) {
  const naziv = decodeURIComponent(rawNaziv).replace(/-/g, '-').toLowerCase();
  const row = await repo.findArticleByName(naziv);
  if (!row) throw new AppError('Article not found', 404);
  return withImageUrl(row);
}

export async function getArticleById(id) {
  const row = await repo.findArticleById(id);
  if (!row) throw new AppError('Article not found', 404);
  return withImageUrl(row);
}

export async function getArticlesByCategoryAndGroup({
  kategorija: rawKategorija,
  grupa: rawGrupa,
  page,
  limit,
  sort,
  partner,
}) {
  const categoryName = normalizeKategorija(rawKategorija);
  const groupName = decodeURIComponent(rawGrupa || '')
    .toLowerCase()
    .replace(/-/g, ' ');

  const [rows, total] = await Promise.all([
    repo.findArticlesByCategoryGroup({
      categoryName,
      groupName,
      page,
      limit,
      sort,
      partner,
    }),
    repo.countArticlesByCategoryGroup({ categoryName, groupName }),
  ]);

  return buildPaginatedResponse(rows.map(withImageUrl), total, page, limit);
}

export async function getArticlesByCategory({
  kategorija: rawKategorija,
  page,
  limit,
  sort,
  partner,
}) {
  const categoryName = normalizeKategorija(rawKategorija);

  const [rows, total] = await Promise.all([
    repo.findArticlesByCategory({ categoryName, page, limit, sort, partner }),
    repo.countArticlesByCategoryGroup({ categoryName }),
  ]);

  return buildPaginatedResponse(rows.map(withImageUrl), total, page, limit);
}

export async function getAllArticles({ page, limit, search, sort, partner }) {
  const { rows, total } = await repo.findAndCountAllArticles({
    page,
    limit,
    search,
    sort,
    partner,
  });

  return buildPaginatedResponse(rows.map(withImageUrl), total, page, limit);
}
