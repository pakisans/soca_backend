import express from 'express';
import { getAllManufacturersHandler } from '../controllers/manufacturersController.js';

const router = express.Router();

router.get('/manufacturers', getAllManufacturersHandler);

export default router;
