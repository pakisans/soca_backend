import transporter from '../config/mailer.js';
import multer from 'multer';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });

export const sendEmail = async (req, res) => {
  const { email, subject, message } = req.body;

  try {
    await transporter.sendMail({
      from: email,
      to: 'soca@soca.rs',
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
      });
    }
    if (req.files['pdf']) {
      attachments.push({
        filename: req.files['pdf'][0].originalname,
        path: req.files['pdf'][0].path,
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'soca@soca.rs',
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
      res.status(500).json({ message: 'Slanje prijave nije uspelo' });
    }
  });
};
