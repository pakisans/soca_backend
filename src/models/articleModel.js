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

  const [rows] = await pool.query(query, [naziv]);

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
  sort,
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

  if (sort) {
    if (sort === 'price-asc') {
      query += ' ORDER BY CAST(a.cena AS UNSIGNED) ASC';
    } else if (sort === 'price-desc') {
      query += ' ORDER BY CAST(a.cena AS UNSIGNED) DESC';
    } else if (sort === 'name-asc') {
      query += ' ORDER BY a.naziv ASC';
    } else if (sort === 'name-desc') {
      query += ' ORDER BY a.naziv DESC';
    } else if (sort === 'relevance') {
      query +=
        ' ORDER BY (CASE WHEN a.cena > 0 THEN 1 ELSE 0 END) DESC, a.cena DESC';
    }
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

export async function getArticlesByCategory({
  categoryName,
  page,
  limit,
  sort,
}) {
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

  if (sort) {
    if (sort === 'price-asc') {
      query += ' ORDER BY CAST(a.cena AS UNSIGNED) ASC';
    } else if (sort === 'price-desc') {
      query += ' ORDER BY CAST(a.cena AS UNSIGNED) DESC';
    } else if (sort === 'name-asc') {
      query += ' ORDER BY a.naziv ASC';
    } else if (sort === 'name-desc') {
      query += ' ORDER BY a.naziv DESC';
    } else if (sort === 'relevance') {
      query +=
        ' ORDER BY (CASE WHEN a.cena > 0 THEN 1 ELSE 0 END) DESC, a.cena DESC';
    }
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

export async function getAllArticles({ page, limit, search, sort, partner }) {
  const offset = (page - 1) * limit;
  const searchQuery = search ? `%${search}%` : '%';
  const partnerQuery = partner ? `%${parseInt(partner, 10)}%` : '%';

  let query = `
    SELECT a.*, kg.naziv AS grupa, 
           REPLACE(kg.parent_group_name, ' ', '-') AS kategorija
    FROM artikli a
    LEFT JOIN kategorije_grupe kg ON SUBSTRING_INDEX(a.sifra, '.', 1) = kg.grupa
    WHERE a.sifra LIKE ? OR a.naziv LIKE ?
  `;

  const queryParams = [searchQuery, searchQuery];

  if (partner) {
    const partnerQuery = partner.toString();
    query += ` AND SUBSTRING_INDEX(a.sifra, '.', -1) = ?`;
    queryParams.push(partnerQuery);
  }

  if (sort) {
    if (sort === 'price-asc') {
      query += ' ORDER BY CAST(a.cena AS UNSIGNED) ASC';
    } else if (sort === 'price-desc') {
      query += ' ORDER BY CAST(a.cena AS UNSIGNED) DESC';
    } else if (sort === 'name-asc') {
      query += ' ORDER BY a.naziv ASC';
    } else if (sort === 'name-desc') {
      query += ' ORDER BY a.naziv DESC';
    } else if (sort === 'relevance') {
      query +=
        ' ORDER BY (CASE WHEN a.cena > 0 THEN 1 ELSE 0 END) DESC, a.cena DESC';
    }
  }

  query += ' LIMIT ? OFFSET ?';
  queryParams.push(limit, offset);

  const [rows] = await pool.query(query, queryParams);

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM artikli 
     WHERE (sifra LIKE ? OR naziv LIKE ?)
     ${partner ? 'AND sifra LIKE ?' : ''}`,
    partner
      ? [searchQuery, searchQuery, `%.${partner}`]
      : [searchQuery, searchQuery],
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
