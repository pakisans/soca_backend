import { pool } from '../config/dbConfig.js';

export async function getArticles(){
    const [rows] = await pool.query("SELECT * FROM artikli");
    return rows;
}

export async function getArticle(id){
    const [rows] = await pool.query("SELECT * FROM artikli WHERE id = ?", [id]);
    return rows[0];
}

export async function getArticlesWithInvalidImage(){
    const query = `
        SELECT * 
        FROM artikli
        WHERE slika NOT LIKE '%.%';
    `;
    const [rows] = await pool.query(query);
    return rows;
}