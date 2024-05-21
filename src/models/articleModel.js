import { pool } from '../config/dbConfig.js';

export async function getArticles() {
  const [rows] = await pool.query('SELECT * FROM artikli');
  return rows.map((article) => ({
    ...article,
    imageUrl: `/images/slikepvp/${article.slika}_${article.naziv.replace(/ /g, '_')}.jpg`,
  }));
}

export async function getArticle(id) {
  const [rows] = await pool.query('SELECT * FROM artikli WHERE id = ?', [id]);
  return rows[0];
}

export async function getArticlesWithInvalidImage() {
  const query = `
        SELECT * 
        FROM artikli
        WHERE slika NOT LIKE '%.%';
    `;
  const [rows] = await pool.query(query);
  return rows;
}

export async function getCategoryIdByName(categoryName) {
  const [rows] = await pool.query('SELECT id FROM kategorije WHERE naziv = ?', [
    categoryName,
  ]);
  return rows[0] ? rows[0].id : null;
}

export async function getArticlesByCategory({
  categoryId,
  searchQuery,
  productCode,
  categoryName,
  page = 1,
  limit = 10,
}) {
  if (categoryName) {
    categoryId = await getCategoryIdByName(categoryName);
  }

  const offset = (page - 1) * limit;
  let query = `
    SELECT a.*
    FROM artikli a
    LEFT JOIN artikli_u_kategoriji ak ON a.id = ak.artikl_id
    LEFT JOIN kategorije k ON ak.kategorija_id = k.id
    WHERE 1=1
  `;

  const queryParams = [];

  if (categoryId) {
    query += ' AND (k.id = ? OR k.parent_id = ?)';
    queryParams.push(categoryId, categoryId);
  }

  if (searchQuery) {
    query += ' AND a.naziv LIKE ?';
    queryParams.push(`%${searchQuery}%`);
  }

  if (productCode) {
    query += ' AND a.sifra LIKE ?';
    queryParams.push(`%${productCode}%`);
  }

  query += ' LIMIT ? OFFSET ?';
  queryParams.push(limit, offset);

  const [rows] = await pool.query(query, queryParams);

  const articlesWithImageUrl = rows.map((article) => {
    let imageUrl;
    if (article.slika.includes('.jpg')) {
      // Ako slika već sadrži .jpg, koristi samo deo pre prvog .jpg
      const imageName = article.slika.substring(
        0,
        article.slika.indexOf('.jpg') + 4,
      );
      imageUrl = `/images/slikepvp/${imageName}`;
    } else {
      // Ako slika ne sadrži .jpg, koristi celu vrednost i dodaj cleanedName
      const cleanedName = article.naziv.replace(/[^a-zA-Z0-9]/g, '_');
      imageUrl = `/images/slikepvp/${article.slika}_${cleanedName}.jpg`;
    }
    return {
      ...article,
      imageUrl,
    };
  });
  return articlesWithImageUrl;
}

export async function getTotalArticlesCount({
  categoryId,
  searchQuery,
  productCode,
  categoryName,
}) {
  if (categoryName) {
    categoryId = await getCategoryIdByName(categoryName);
  }

  let query = `
    SELECT COUNT(a.id) as total
    FROM artikli a
    LEFT JOIN artikli_u_kategoriji ak ON a.id = ak.artikl_id
    LEFT JOIN kategorije k ON ak.kategorija_id = k.id
    WHERE 1=1
  `;

  const queryParams = [];

  if (categoryId) {
    query += ' AND (k.id = ? OR k.parent_id = ?)';
    queryParams.push(categoryId, categoryId);
  }

  if (searchQuery) {
    query += ' AND a.naziv LIKE ?';
    queryParams.push(`%${searchQuery}%`);
  }

  if (productCode) {
    query += ' AND a.sifra LIKE ?';
    queryParams.push(`%${productCode}%`);
  }

  const [rows] = await pool.query(query, queryParams);
  return rows[0].total;
}
