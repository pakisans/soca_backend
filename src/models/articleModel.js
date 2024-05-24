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

export async function getTotalArticlesCount({ categoryName, groupName }) {
  let query = `
    SELECT COUNT(a.id) as total
    FROM artikli a
    LEFT JOIN kategorije_grupe kg ON a.sifra LIKE CONCAT(kg.grupa, '%')
    LEFT JOIN kategorije k ON kg.kategorija_id = k.id
    WHERE 1=1
  `;
  const queryParams = [];

  if (categoryName) {
    query += ' AND k.naziv = ?';
    queryParams.push(categoryName);
  }

  if (groupName) {
    query += ' AND kg.naziv = ?';
    queryParams.push(groupName);
  }

  const [rows] = await pool.query(query, queryParams);
  return rows[0].total;
}

export async function getArticlesByCategory({
  categoryName,
  groupName,
  page,
  limit,
}) {
  const offset = (page - 1) * limit;
  let query = `
    SELECT a.*
    FROM artikli a
    LEFT JOIN kategorije_grupe kg ON a.sifra LIKE CONCAT(kg.grupa, '%')
    LEFT JOIN kategorije k ON kg.kategorija_id = k.id
    WHERE 1=1
  `;
  const queryParams = [];
  console.log('off', categoryName, groupName);
  if (categoryName) {
    query += ' AND k.naziv = ?';
    queryParams.push(categoryName);
  }

  if (groupName) {
    query += ' AND kg.naziv = ?';
    queryParams.push(groupName);
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
