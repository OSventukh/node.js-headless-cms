import * as dotenv from 'dotenv';
import nodemailer from 'nodemailer';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    // does not fail on invalid certs
    rejectUnauthorized: false,
  },
});

export default async function sendMail({ from, to, subject, body }) {
  const info = await transporter.sendMail({
    from: from || process.env.EMAIL_USER, // sender address
    to, // list of receivers
    subject, // Subject line
    html: body, // html body
  });
  return info;
}
