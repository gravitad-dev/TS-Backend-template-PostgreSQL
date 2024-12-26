import { Request, Response, NextFunction } from 'express';
import prisma from '../../../config/database';
import jwt from 'jsonwebtoken';
import { transporter } from '../../../config/nodemailer';
import bcrypt from 'bcryptjs';
import { resetPasswordTemplate } from '../emaiTemplate';

const FRONTEND_URL = process.env.FRONTEND_URL;

export const requestPasswordReset = async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ message: "User doesn't exist" });
      return;
    }

    const secret = process.env.JWT_SECRET + user.password;
    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '15m' });

    const resetURL = `${FRONTEND_URL}/reset-password?id=${user.id}&token=${token}`;

    const mailOptions = {
      to: user.email,
      from: process.env.MAIL_FROM,
      subject: 'Password Reset Request',
      html: resetPasswordTemplate(user.name || user.username, resetURL),
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: `Password reset link sent to ${user.email} and expires in 15 minutes` });
  } catch (error: any) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { id, token, newPassword, confirmPassword } = req.body;

  try {
    if (!id || !token || !newPassword || !confirmPassword) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: 'Passwords do not match' });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      res.status(400).json({
        error:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
      });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const secret = process.env.JWT_SECRET + user.password;
    try {
      jwt.verify(token, secret);
    } catch (error) {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const userId = Number(id);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: error.message });
  }
};
