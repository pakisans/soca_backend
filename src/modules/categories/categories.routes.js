import express from 'express';
import { getAllCategories } from './categories.controller.js';

const router = express.Router();

router.get('/categories', getAllCategories);

export default router;
