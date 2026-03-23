import express from 'express';
import { getAllManufacturers } from './manufacturers.controller.js';

const router = express.Router();

router.get('/manufacturers', getAllManufacturers);

export default router;
