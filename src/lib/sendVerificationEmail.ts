import nodemailer from "nodemailer";

import { verificationEmailTemplate } from "./emailTemplates/verificationEmailTemplate";

export const sendEmail = async (
  code: string,
  email: string,
  isResend = false
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"YourMeal" <${process.env.SMTP_USER}>`,
    to: email,
    subject: isResend
      ? "Повторное подтверждение регистрации"
      : "Код подтверждения регистрации",
    html: verificationEmailTemplate(code),
  });
};
