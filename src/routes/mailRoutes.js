import express from 'express';
import {
  sendEmail,
  reportFault,
  sendCartEmail,
} from '../controllers/mailController.js';

const router = express.Router();

router.post('/sendEmail', sendEmail);
router.post('/reportFault', reportFault);
router.post('/sendCartEmail', sendCartEmail);

export default router;
