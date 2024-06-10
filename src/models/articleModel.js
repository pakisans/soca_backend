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

export async function getArticleByName(naziv) {
  const query = `
    SELECT * FROM artikli
    WHERE LOWER(REPLACE(naziv, ' ', '-')) = LOWER(?)
  `;

  console.log('Executing query:', query); // Debugging
  console.log('Query params:', [naziv]); // Debugging

  const [rows] = await pool.query(query, [naziv]);

  console.log('Query result:', rows); // Debugging

  if (rows.length === 0) {
    return null;
  }

  const article = rows[0];

  let imageUrl;
  if (article.slika.includes('.jpg')) {
    const imageName = article.slika.substring(
      0,
      article.slika.indexOf('.jpg') + 4,
    );
    imageUrl = `/images/slikepvp/${imageName}`;
  } else {
    const cleanedName = article.naziv.replace(/[^a-zA-Z0-9]/g, '_');
    imageUrl = `/images/slikepvp/${article.slika}_${cleanedName}.jpg`;
  }

  console.log('Final article object:', {
    ...article,
    imageUrl,
  }); // Debugging

  return {
    ...article,
    imageUrl,
  };
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

export async function getArticlesByCategoryAndGroup({
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

  if (categoryName) {
    query += ' AND LOWER(k.naziv) = LOWER(?)';
    queryParams.push(categoryName);
  }

  if (groupName) {
    query += ' AND LOWER(kg.naziv) = LOWER(?)';
    queryParams.push(groupName);
  }

  query += ' LIMIT ? OFFSET ?';
  queryParams.push(limit, offset);

  console.log('SQL Query:', query);
  console.log('Query Params:', queryParams);

  const [rows] = await pool.query(query, queryParams);

  const articlesWithImageUrl = rows.map((article) => {
    let imageUrl;
    if (article.slika.includes('.jpg')) {
      const imageName = article.slika.substring(
        0,
        article.slika.indexOf('.jpg') + 4,
      );
      imageUrl = `/images/slikepvp/${imageName}`;
    } else {
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

export async function getArticlesByCategory({ categoryName, page, limit }) {
  const offset = (page - 1) * limit;
  let query = `
    SELECT a.*
    FROM artikli a
    LEFT JOIN kategorije k ON a.kategorija_id = k.id
    WHERE 1=1
  `;
  const queryParams = [];

  if (categoryName) {
    query += ' AND LOWER(k.naziv) = LOWER(?)';
    queryParams.push(categoryName);
  }

  query += ' LIMIT ? OFFSET ?';
  queryParams.push(limit, offset);

  const [rows] = await pool.query(query, queryParams);

  const articlesWithImageUrl = rows.map((article) => {
    let imageUrl;
    if (article.slika.includes('.jpg')) {
      const imageName = article.slika.substring(
        0,
        article.slika.indexOf('.jpg') + 4,
      );
      imageUrl = `/images/slikepvp/${imageName}`;
    } else {
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

export async function getArticleById(id) {
  const [rows] = await pool.query('SELECT * FROM artikli WHERE id = ?', [id]);

  if (rows.length === 0) {
    return null;
  }

  const article = rows[0];

  let imageUrl;
  if (article.slika.includes('.jpg')) {
    const imageName = article.slika.substring(
      0,
      article.slika.indexOf('.jpg') + 4,
    );
    imageUrl = `/images/slikepvp/${imageName}`;
  } else {
    const cleanedName = article.naziv.replace(/[^a-zA-Z0-9]/g, '_');
    imageUrl = `/images/slikepvp/${article.slika}_${cleanedName}.jpg`;
  }

  return {
    ...article,
    imageUrl,
  };
}

export async function getAllArticles({ page, limit, search }) {
  const offset = (page - 1) * limit;
  const searchQuery = search ? `%${search}%` : '%';

  const [rows] = await pool.query(
    `SELECT a.*, kg.naziv AS grupa, 
            REPLACE(kg.parent_group_name, ' ', '-') AS kategorija
     FROM artikli a
     LEFT JOIN kategorije_grupe kg ON SUBSTRING_INDEX(a.sifra, '.', 1) = kg.grupa
     WHERE a.sifra LIKE ? OR a.naziv LIKE ?
     LIMIT ? OFFSET ?`,
    [searchQuery, searchQuery, limit, offset],
  );
  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) as total FROM artikli WHERE sifra LIKE ? OR naziv LIKE ?',
    [searchQuery, searchQuery],
  );

  const articlesWithImageUrl = rows.map((article) => {
    let imageUrl;
    if (article.slika.includes('.jpg')) {
      const imageName = article.slika.substring(
        0,
        article.slika.indexOf('.jpg') + 4,
      );
      imageUrl = `/images/slikepvp/${imageName}`;
    } else {
      const cleanedName = article.naziv.replace(/[^a-zA-Z0-9]/g, '_');
      imageUrl = `/images/slikepvp/${article.slika}_${cleanedName}.jpg`;
    }
    return {
      ...article,
      imageUrl,
    };
  });

  return { articles: articlesWithImageUrl, total };
}
