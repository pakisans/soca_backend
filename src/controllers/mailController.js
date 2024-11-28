import transporter from '../config/mailer.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { generateCsv } from '../utils/csvUtil.js';
import { fileURLToPath } from 'url';

const upload = multer({ dest: 'uploads/' });

export const sendEmail = async (req, res) => {
  const { email, subject, message } = req.body;

  try {
    await transporter.sendMail({
      from: email,
      to: 'servis@soca.rs',
      subject: subject,
      text: message,
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
};

export const reportFault = (req, res) => {
  upload.fields([{ name: 'image' }, { name: 'pdf' }])(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading files' });
    }

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
    } = req.body;

    const attachments = [];
    if (req.files['image']) {
      attachments.push({
        filename: req.files['image'][0].originalname,
        path: req.files['image'][0].path,
        contentType: req.files['image'][0].mimetype,
      });
    }
    if (req.files['pdf']) {
      attachments.push({
        filename: req.files['pdf'][0].originalname,
        path: req.files['pdf'][0].path,
        contentType: req.files['pdf'][0].mimetype,
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'servis@soca.rs',
      subject: 'Nova prijava kvara',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7ff; border-radius: 8px;">
          <h2 style="color: #8E1B13; text-align: center;">Nova prijava kvara</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background-color: #1C3738; color: #ffffff;">
              <th style="padding: 10px; text-align: left;">Polje</th>
              <th style="padding: 10px; text-align: left;">Vrednost</th>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Ime i prezime</td>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Email</td>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Adresa</td>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${address}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Mesto</td>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${city}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Telefon</td>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${phone}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Proizvođač</td>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${manufacturer}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Aparat</td>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${device}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">PNC/Servisni broj/Ref Code</td>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${pnc}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Model</td>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${model}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Serijski broj</td>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${serialNumber}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Opis kvara</td>
              <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${description}</td>
            </tr>
          </table>
        </div>
      `,
      attachments,
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Prijava kvara je uspešno poslata!' });

      attachments.forEach((file) => {
        fs.unlinkSync(file.path);
      });
    } catch (error) {
      console.error('Error sending email:', error);
      res
        .status(500)
        .json({ message: 'Slanje prijave nije uspelo', error: error.message });
    }
  });
};

export const sendCartEmail = async (req, res) => {
  const {
    name,
    email,
    phone,
    message,
    artikalPodaci,
    ukupnaCena,
    address,
    city,
  } = req.body;

  const itemsHtml = artikalPodaci
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${item.sifra}</td>
      <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${item.price} RSD</td>
      <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${item.kolicina}</td>
    </tr>
  `,
    )
    .join('');

  const csvData = generateCsv(artikalPodaci, ukupnaCena);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const csvFilePath = path.join(__dirname, 'order.csv');

  fs.writeFileSync(csvFilePath, csvData);

  const mailOptions = {
    from: email,
    to: 'servis@soca.rs',
    subject: 'Nova porudžbina',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 670px; margin: 0 auto; padding: 20px; background-color: #f7f7ff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #8E1B13; text-align: center; margin-bottom: 20px;">Nova porudžbina</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #1C3738; color: #ffffff;">
              <th style="padding: 12px; text-align: left; border: 1px solid #dddddd;">Naziv</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dddddd;">Šifra</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dddddd;">Cena</th>
              <th style="padding: 12px; text-align: left; border: 1px solid #dddddd;">Količina</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="padding: 12px; text-align: right; border-top: 1px solid #dddddd; margin-top: 10px; font-weight: bold; color: #8E1B13;">
          Ukupna cena: ${ukupnaCena} RSD
        </div>
        <div style="margin-top: 20px;">
          <p style="margin: 5px 0;"><strong>Ime i Prezime:</strong> ${name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Telefon:</strong> ${phone}</p>
          <p style="margin: 5px 0;"><strong>Grad:</strong> ${city?.value}</p>
          <p style="margin: 5px 0;"><strong>Poštanski broj:</strong> ${city?.zip}</p>
          <p style="margin: 5px 0;"><strong>Adresa:</strong> ${address}</p>
          <p style="margin: 5px 0;"><strong>Poruka:</strong> ${message}</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `porudžbina-${name}-${phone}.csv`,
        path: csvFilePath,
        contentType: 'text/csv',
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
    // Obriši CSV fajl nakon slanja emaila
    fs.unlinkSync(csvFilePath);
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
    // Osiguraj brisanje CSV fajla čak i ako dođe do greške
    fs.unlinkSync(csvFilePath);
  }
};

export const sendInquiry = async (req, res) => {
  const { name, email, phone, description, articleName, articleCode } =
    req.body;

  const mailOptions = {
    from: email,
    to: 'servis@soca.rs',
    subject: `Upit za nabavku proizvoda: ${articleName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f7f7ff; border-radius: 8px;">
        <h2 style="color: #8E1B13; text-align: center;">Upit za nabavku proizvoda</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr style="background-color: #1C3738; color: #ffffff;">
            <th style="padding: 10px; text-align: left;">Polje</th>
            <th style="padding: 10px; text-align: left;">Vrednost</th>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Ime i prezime</td>
            <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Email</td>
            <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Telefon</td>
            <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${phone}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Proizvod</td>
            <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${articleName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Šifra proizvoda</td>
            <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${articleCode}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #dddddd;">Opis upita</td>
            <td style="padding: 10px; border-bottom: 1px solid #dddddd;">${description}</td>
          </tr>
        </table>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Upit je uspešno poslat!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Greška prilikom slanja upita' });
  }
};
