import express from 'express';
import { sendEmail, reportFault } from '../controllers/mailController.js';

const router = express.Router();

router.post('/sendEmail', sendEmail);
router.post('/reportFault', reportFault);

export default router;
