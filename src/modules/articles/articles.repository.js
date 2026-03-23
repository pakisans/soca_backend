import { pool } from '../../config/database.js';
import { SORT_MAPPING } from '../../constants/sort.js';

export async function findArticlesWithInvalidImage() {
  const [rows] = await pool.query(
    `SELECT * FROM artikli WHERE slika NOT LIKE '%.%'`,
  );
  return rows;
}

export async function findArticleByName(naziv) {
  const [rows] = await pool.query(
    `SELECT * FROM artikli WHERE LOWER(REPLACE(naziv, ' ', '-')) = LOWER(?)`,
    [naziv],
  );
  return rows[0] || null;
}

export async function findArticleById(id) {
  const [rows] = await pool.query('SELECT * FROM artikli WHERE id = ?', [id]);
  return rows[0] || null;
}

export async function countArticlesByCategoryGroup({ categoryName, groupName }) {
  let query = `
    SELECT COUNT(a.id) as total
    FROM artikli a
    LEFT JOIN kategorije_grupe kg ON a.sifra LIKE CONCAT(kg.grupa, '%')
    LEFT JOIN kategorije k ON kg.kategorija_id = k.id
    WHERE 1=1
  `;
  const params = [];

  if (categoryName) {
    query += ' AND k.naziv = ?';
    params.push(categoryName);
  }
  if (groupName) {
    query += ' AND kg.naziv = ?';
    params.push(groupName);
  }

  const [rows] = await pool.query(query, params);
  return rows[0].total;
}

export async function findArticlesByCategoryGroup({
  categoryName,
  groupName,
  page,
  limit,
  sort = 'relevance',
  partner,
}) {
  const offset = (page - 1) * limit;
  let query = `
    SELECT DISTINCT a.*
    FROM artikli a
    LEFT JOIN kategorije_grupe kg ON a.sifra LIKE CONCAT(kg.grupa, '%')
    LEFT JOIN kategorije k ON kg.kategorija_id = k.id
    WHERE 1=1
  `;
  const params = [];

  if (categoryName) {
    query += ' AND LOWER(k.naziv) = LOWER(?)';
    params.push(categoryName);
  }
  if (groupName) {
    query += ' AND LOWER(kg.naziv) = LOWER(?)';
    params.push(groupName);
  }
  if (partner) {
    query += ' AND SUBSTRING_INDEX(SUBSTRING_INDEX(a.sifra, ".", 2), ".", -1) = ?';
    params.push(partner.toString());
  }

  if (sort && SORT_MAPPING[sort]) {
    query += ` ORDER BY ${SORT_MAPPING[sort]}`;
  }

  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.query(query, params);
  return rows;
}

export async function findArticlesByCategory({
  categoryName,
  page,
  limit,
  sort = 'relevance',
  partner,
}) {
  const offset = (page - 1) * limit;
  let query = `
    SELECT DISTINCT a.*
    FROM artikli a
    LEFT JOIN kategorije k ON a.kategorija_id = k.id
    WHERE 1=1
  `;
  const params = [];

  if (categoryName) {
    query += ' AND LOWER(k.naziv) = LOWER(?)';
    params.push(categoryName);
  }
  if (partner) {
    query += ' AND SUBSTRING_INDEX(SUBSTRING_INDEX(a.sifra, ".", 2), ".", -1) = ?';
    params.push(partner.toString());
  }

  if (sort && SORT_MAPPING[sort]) {
    query += ` ORDER BY ${SORT_MAPPING[sort]}`;
  }

  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [rows] = await pool.query(query, params);
  return rows;
}

export async function findAndCountAllArticles({ page, limit, search, sort = 'relevance', partner }) {
  const offset = (page - 1) * limit;
  const queryParams = [];

  let query = `
    SELECT a.*,
           kg.seo_naziv_grupe AS grupa,
           kg.seo_parent AS kategorija
    FROM artikli a
    LEFT JOIN kategorije_grupe kg
      ON SUBSTRING_INDEX(a.sifra, '.', 1) = kg.grupa
    WHERE 1=1
  `;

  if (search) {
    const terms = search.split(' ');
    for (const term of terms) {
      query += ' AND (a.naziv LIKE ? OR a.opis LIKE ? OR a.sifra LIKE ?)';
      const like = `%${term}%`;
      queryParams.push(like, like, like);
    }
  }
  if (partner) {
    query += ` AND SUBSTRING_INDEX(SUBSTRING_INDEX(a.sifra, '.', 2), '.', -1) = ?`;
    queryParams.push(partner.toString());
  }

  if (sort && SORT_MAPPING[sort]) {
    query += ` ORDER BY ${SORT_MAPPING[sort]}`;
  }

  query += ' LIMIT ? OFFSET ?';
  queryParams.push(limit, offset);

  const [rows] = await pool.query(query, queryParams);

  let countQuery = 'SELECT COUNT(*) as total FROM artikli WHERE 1=1';
  const countParams = [];
  if (search) {
    const terms = search.split(' ');
    for (const term of terms) {
      countQuery += ' AND (naziv LIKE ? OR opis LIKE ? OR sifra LIKE ?)';
      const like = `%${term}%`;
      countParams.push(like, like, like);
    }
  }
  if (partner) {
    countQuery += ` AND SUBSTRING_INDEX(SUBSTRING_INDEX(sifra, '.', 2), '.', -1) = ?`;
    countParams.push(partner.toString());
  }

  const [[{ total }]] = await pool.query(countQuery, countParams);

  return { rows, total };
}
