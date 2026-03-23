import express from 'express';
import { uploadReportFiles } from '../../middlewares/upload.js';
import * as controller from './mail.controller.js';

const router = express.Router();

router.post('/sendEmail', controller.sendEmail);
router.post('/reportFault', uploadReportFiles, controller.reportFault);
router.post('/sendCartEmail', controller.sendCartEmail);
router.post('/sendInquiry', controller.sendInquiry);

export default router;
