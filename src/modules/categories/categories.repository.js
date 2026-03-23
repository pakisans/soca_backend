import { pool } from '../../config/database.js';

export async function findAllCategoriesWithGroups() {
  const [categories] = await pool.query(
    'SELECT * FROM kategorije WHERE parent_id = 0',
  );
  const [groups] = await pool.query('SELECT * FROM kategorije_grupe');

  return categories.map((category) => ({
    ...category,
    groups: groups
      .filter((group) => group.kategorija_id === category.id)
      .sort((a, b) => a.naziv.localeCompare(b.naziv)),
  }));
}
