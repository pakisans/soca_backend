import express from 'express';
import {
  sendEmail,
  reportFault,
  sendCartEmail,
  sendInquiry,
} from '../controllers/mailController.js';

const router = express.Router();

router.post('/sendEmail', sendEmail);
router.post('/reportFault', reportFault);
router.post('/sendCartEmail', sendCartEmail);
router.post('/sendInquiry', sendInquiry);

export default router;
