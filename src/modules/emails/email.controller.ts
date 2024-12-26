import { Request, Response } from 'express';
import { sendEmail, sendBulkEmail } from './email.service';

// Function to handle sending a single email
export const handleSendEmail = async (req: Request, res: Response) => {
  const { to, subject, text, html } = req.body;

  try {
    const info = await sendEmail(to, subject, html);
    res.status(200).json({ message: 'Email sent successfully', info });
  } catch (error: any) {
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
};

// Function to handle sending bulk emails
export const handleSendBulkEmail = async (req: Request, res: Response) => {
  const { to, subject, html } = req.body;

  try {
    const info = await sendBulkEmail(to, subject, html);
    res.status(200).json({ message: 'Bulk emails sent successfully', info });
  } catch (error: any) {
    res.status(500).json({ message: 'Error sending bulk emails', error: error.message });
  }
};
