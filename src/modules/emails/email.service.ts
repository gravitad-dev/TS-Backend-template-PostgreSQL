import {
  isValidEmail,
  isNotEmpty,
  isValidBulkEmails,
  isValidHtmlContent,
  isValidSenderEmail,
  isValidSubject,
  validationMessages,
} from './email.validator';
import { Buffer } from 'buffer';

import { transporter } from '../../config/nodemailer';

// Function to send a single email
export const sendEmail = async (to: string, subject: string, html: string, pdfBuffer?: Buffer) => {
  if (pdfBuffer && !Buffer.isBuffer(pdfBuffer)) {
    throw new Error('Invalid PDF buffer');
  }
  // Validate the recipient email format
  if (!isValidEmail(to)) {
    throw new Error(validationMessages.invalidEmail);
  }

  // Validate the sender email
  const senderEmail = process.env.MAIL_FROM || '';
  if (!isValidSenderEmail(senderEmail)) {
    throw new Error(validationMessages.invalidSenderEmail);
  }

  // Check if any field is missing or undefined
  if (![to, subject, html].every(isNotEmpty)) {
    throw new Error(validationMessages.missingField + 'to, subject or html');
  }

  // Validate that the subject has the minimum length
  if (!isValidSubject(subject)) {
    throw new Error(validationMessages.invalidSubject);
  }

  // Validate that the HTML content is not empty
  if (!isValidHtmlContent(html)) {
    throw new Error(validationMessages.invalidHtmlContent);
  }

  const mailOptions = {
    from: senderEmail, // Sender email
    to,
    subject,
    html,
    attachments: pdfBuffer
      ? [
          {
            filename: 'invoice.pdf',
            content: pdfBuffer,
          },
        ]
      : undefined,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Could not send the email');
  }
};

// Function to send bulk emails
export const sendBulkEmail = async (to: string[], subject: string, html: string) => {
  // Validate the email list
  if (!isValidBulkEmails(to)) {
    throw new Error(validationMessages.invalidBulkEmails);
  }

  // Check if any field is missing or undefined
  if (![subject, html].every(isNotEmpty)) {
    throw new Error(validationMessages.missingField + 'subject or html');
  }

  // Validate that the subject has the minimum length
  if (!isValidSubject(subject)) {
    throw new Error(validationMessages.invalidSubject);
  }

  // Validate that the HTML content is not empty
  if (!isValidHtmlContent(html)) {
    throw new Error(validationMessages.invalidHtmlContent);
  }

  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: to.join(', '), // Convert email list to a comma-separated string
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending bulk emails: ', error);
    throw new Error('Could not send bulk emails');
  }
};
