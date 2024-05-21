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
