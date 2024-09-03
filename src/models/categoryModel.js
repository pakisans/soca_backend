import { pool } from '../config/dbConfig.js';

export const getParentCategories = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM kategorije WHERE parent_id = 0',
  );
  return rows;
};

export const getChildCategories = async () => {
  const [rows] = await pool.query(
    'SELECT * FROM kategorije WHERE parent_id != 0',
  );
  return rows;
};

export const getAllCategoriesWithGroups = async () => {
  const [categories] = await pool.query(
    'SELECT * FROM kategorije WHERE parent_id = 0',
  );
  const [groups] = await pool.query('SELECT * FROM kategorije_grupe');

  const groupedCategories = categories.map((category) => ({
    ...category,
    groups: groups
      .filter((group) => group.kategorija_id === category.id)
      .sort((a, b) => a.naziv.localeCompare(b.naziv)), // Sortiramo po 'naziv_kategorije'
  }));

  return groupedCategories;
};
