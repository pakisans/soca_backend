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
  sort = 'relevance',
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
  console.log('a bree', sort);
  if (categoryName) {
    query += ' AND LOWER(k.naziv) = LOWER(?)';
    queryParams.push(categoryName);
  }

  if (groupName) {
    query += ' AND LOWER(kg.naziv) = LOWER(?)';
    queryParams.push(groupName);
  }

  // Dodavanje sortiranja na osnovu dostupnosti i cene
  const sortMapping = {
    'price-asc': `CASE 
                    WHEN a.aktivan = 1 AND a.kolicina > 0 AND a.prodajna_cena > 0 THEN 1 
                    WHEN a.aktivan = 1 AND a.kolicina > 0 THEN 2 
                    ELSE 3 
                  END ASC, 
                  CAST(a.prodajna_cena AS UNSIGNED) ASC`,
    'price-desc': `CASE 
                     WHEN a.aktivan = 1 AND a.kolicina > 0 AND a.prodajna_cena > 0 THEN 1 
                     WHEN a.aktivan = 1 AND a.kolicina > 0 THEN 2 
                     ELSE 3 
                   END ASC, 
                   CAST(a.prodajna_cena AS UNSIGNED) DESC`,
    'name-asc': 'a.naziv ASC',
    'name-desc': 'a.naziv DESC',
    relevance: `CASE 
                    WHEN a.aktivan = 1 AND a.kolicina > 0 AND a.prodajna_cena > 0 THEN 1 
                    WHEN a.aktivan = 1 AND a.kolicina > 0 THEN 2 
                    ELSE 3 
                  END ASC, 
                  a.prodajna_cena DESC`,
  };

  if (sort && sortMapping[sort]) {
    query += ` ORDER BY ${sortMapping[sort]}`;
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
  sort = 'relevance',
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

  // Dodavanje sortiranja na osnovu dostupnosti i cene
  const sortMapping = {
    'price-asc': `CASE 
                    WHEN a.aktivan = 1 AND a.kolicina > 0 AND a.prodajna_cena > 0 THEN 1 
                    WHEN a.aktivan = 1 AND a.kolicina > 0 THEN 2 
                    ELSE 3 
                  END ASC, 
                  CAST(a.prodajna_cena AS UNSIGNED) ASC`,
    'price-desc': `CASE 
                     WHEN a.aktivan = 1 AND a.kolicina > 0 AND a.prodajna_cena > 0 THEN 1 
                     WHEN a.aktivan = 1 AND a.kolicina > 0 THEN 2 
                     ELSE 3 
                   END ASC, 
                   CAST(a.prodajna_cena AS UNSIGNED) DESC`,
    'name-asc': 'a.naziv ASC',
    'name-desc': 'a.naziv DESC',
    relevance: `CASE 
                    WHEN a.aktivan = 1 AND a.kolicina > 0 AND a.prodajna_cena > 0 THEN 1 
                    WHEN a.aktivan = 1 AND a.kolicina > 0 THEN 2 
                    ELSE 3 
                  END ASC, 
                  a.prodajna_cena DESC`,
  };

  if (sort && sortMapping[sort]) {
    query += ` ORDER BY ${sortMapping[sort]}`;
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

export async function getAllArticles({
  page,
  limit,
  search,
  sort = 'relevance',
  partner,
}) {
  const offset = (page - 1) * limit;
  const searchQuery = search ? `%${search}%` : '%';
  const queryParams = [searchQuery, searchQuery];

  let query = `
    SELECT a.*, kg.naziv AS grupa, 
           REPLACE(kg.parent_group_name, ' ', '-') AS kategorija
    FROM artikli a
    LEFT JOIN kategorije_grupe kg ON SUBSTRING_INDEX(a.sifra, '.', 1) = kg.grupa
    WHERE (a.sifra LIKE ? OR a.naziv LIKE ?)
  `;

  // Dodavanje uslova za partnera ako je prisutan
  if (partner) {
    query += ` AND SUBSTRING_INDEX(SUBSTRING_INDEX(a.sifra, '.', 2), '.', -1) = ?`;
    queryParams.push(partner.toString());
  }

  // Dodavanje sortiranja ako je prisutno
  const sortMapping = {
    'price-asc': `CASE 
                    WHEN a.aktivan = 1 AND a.kolicina > 0 AND a.prodajna_cena > 0 THEN 1 
                    WHEN a.aktivan = 1 AND a.kolicina > 0 THEN 2 
                    ELSE 3 
                  END ASC, 
                  CAST(a.prodajna_cena AS UNSIGNED) ASC`,
    'price-desc': `CASE 
                     WHEN a.aktivan = 1 AND a.kolicina > 0 AND a.prodajna_cena > 0 THEN 1 
                     WHEN a.aktivan = 1 AND a.kolicina > 0 THEN 2 
                     ELSE 3 
                   END ASC, 
                   CAST(a.prodajna_cena AS UNSIGNED) DESC`,
    'name-asc': 'a.naziv ASC',
    'name-desc': 'a.naziv DESC',
    relevance: `CASE 
                    WHEN a.aktivan = 1 AND a.kolicina > 0 AND a.prodajna_cena > 0 THEN 1 
                    WHEN a.aktivan = 1 AND a.kolicina > 0 THEN 2 
                    ELSE 3 
                  END ASC, 
                  a.prodajna_cena DESC`,
  };

  if (sort && sortMapping[sort]) {
    query += ` ORDER BY ${sortMapping[sort]}`;
  }

  // Dodavanje limita i offseta
  query += ' LIMIT ? OFFSET ?';
  queryParams.push(limit, offset);

  // Izvršavanje glavnog query-ja
  const [rows] = await pool.query(query, queryParams);

  // Izračunavanje ukupnog broja artikala
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM artikli 
    WHERE (sifra LIKE ? OR naziv LIKE ?)
    ${partner ? 'AND SUBSTRING_INDEX(SUBSTRING_INDEX(sifra, ".", 2), ".", -1) = ?' : ''}
  `;
  const countParams = partner
    ? [searchQuery, searchQuery, partner.toString()]
    : [searchQuery, searchQuery];
  const [[{ total }]] = await pool.query(countQuery, countParams);

  // Dodavanje imageUrl za svaki artikal
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
