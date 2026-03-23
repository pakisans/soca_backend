import { pool } from '../../config/database.js';

export async function findAllManufacturers() {
  const [rows] = await pool.query('SELECT * FROM proizvodjaci');
  return rows;
}
