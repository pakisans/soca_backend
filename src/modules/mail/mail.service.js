import fs from 'fs';
import os from 'os';
import path from 'path';
import transporter from '../../config/mailer.js';
import { config } from '../../config/index.js';
import { generateCsv } from '../../utils/csv.js';
import * as templates from './mail.templates.js';

export async function sendContactEmail({ email, subject, message }) {
  await transporter.sendMail({
    from: email,
    to: config.mail.recipient,
    subject,
    text: message,
  });
}

export async function sendFaultReport({ body, files }) {
  const {
    name,
    email,
    address,
    city,
    phone,
    manufacturer,
    device,
    pnc,
    model,
    serialNumber,
    description,
  } = body;

  const attachments = [];
  if (files?.image?.[0]) {
    const f = files.image[0];
    attachments.push({
      filename: f.originalname,
      path: f.path,
      contentType: f.mimetype,
    });
  }
  if (files?.pdf?.[0]) {
    const f = files.pdf[0];
    attachments.push({
      filename: f.originalname,
      path: f.path,
      contentType: f.mimetype,
    });
  }

  try {
    await transporter.sendMail({
      from: config.mail.user,
      to: config.mail.recipient,
      subject: 'Nova prijava kvara',
      html: templates.faultReportHtml({
        name,
        email,
        address,
        city,
        phone,
        manufacturer,
        device,
        pnc,
        model,
        serialNumber,
        description,
      }),
      attachments,
    });
  } finally {
    for (const attachment of attachments) {
      fs.unlink(attachment.path, () => {});
    }
  }
}

export async function sendCartOrder({
  name,
  email,
  phone,
  message,
  artikalPodaci,
  ukupnaCena,
  address,
  city,
}) {
  const csvData = generateCsv(artikalPodaci, ukupnaCena);
  const csvFilePath = path.join(os.tmpdir(), `order-${Date.now()}.csv`);
  fs.writeFileSync(csvFilePath, csvData);

  try {
    await transporter.sendMail({
      from: email,
      to: config.mail.recipient,
      subject: 'Nova porudžbina',
      html: templates.cartOrderHtml({
        name,
        email,
        phone,
        city,
        address,
        message,
        artikalPodaci,
        ukupnaCena,
      }),
      attachments: [
        {
          filename: `porudžbina-${name}-${phone}.csv`,
          path: csvFilePath,
          contentType: 'text/csv',
        },
      ],
    });
  } finally {
    fs.unlink(csvFilePath, () => {});
  }
}

export async function sendInquiry({
  name,
  email,
  phone,
  description,
  articleName,
  articleCode,
}) {
  await transporter.sendMail({
    from: email,
    to: config.mail.recipient,
    subject: `Upit za nabavku proizvoda: ${articleName}`,
    html: templates.inquiryHtml({
      name,
      email,
      phone,
      articleName,
      articleCode,
      description,
    }),
  });
}
