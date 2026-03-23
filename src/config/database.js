import mysql from 'mysql2';
import { config } from './index.js';

export const pool = mysql
  .createPool({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    connectionLimit: config.db.connectionLimit,
  })
  .promise();
