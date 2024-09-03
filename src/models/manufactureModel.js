// models/manufacturerModel.js

import { pool } from '../config/dbConfig.js';

export async function getAllManufacturers() {
  const query = `
    SELECT * 
    FROM proizvodjaci
  `;

  const [rows] = await pool.query(query);

  return rows;
}
