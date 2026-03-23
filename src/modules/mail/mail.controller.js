import * as service from './mail.service.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';

export const sendEmail = asyncHandler(async (req, res) => {
  const { email, subject, message } = req.body;
  await service.sendContactEmail({ email, subject, message });
  res.status(200).json({ message: 'Email sent successfully' });
});

export const reportFault = asyncHandler(async (req, res) => {
  await service.sendFaultReport({ body: req.body, files: req.files });
  res.status(200).json({ message: 'Prijava kvara je uspešno poslata!' });
});

export const sendCartEmail = asyncHandler(async (req, res) => {
  const { name, email, phone, message, artikalPodaci, ukupnaCena, address, city } = req.body;
  await service.sendCartOrder({ name, email, phone, message, artikalPodaci, ukupnaCena, address, city });
  res.status(200).json({ message: 'Email sent successfully' });
});

export const sendInquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, description, articleName, articleCode } = req.body;
  await service.sendInquiry({ name, email, phone, description, articleName, articleCode });
  res.status(200).json({ message: 'Upit je uspešno poslat!' });
});
