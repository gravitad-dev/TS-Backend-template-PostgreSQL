import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { uploadToLocal } from '../utils';

const validRoles = ['USER', 'ADMIN', 'SUPERADMIN'];

export const validateUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, name, username, password, role } = req.body;

    if (!email || !name || !username || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (username.length < 3 || username.length > 20) {
      res
        .status(400)
        .json({ error: 'Username must be between 3 and 20 characters' });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        error:
          'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
      });
      return;
    }

    if (role) {
      const roleUpperCase = role.toUpperCase();
      const roleRegex = new RegExp(`^(${validRoles.join('|')})$`, 'i');
      if (!roleRegex.test(roleUpperCase)) {
        res.status(400).json({
          error: `Invalid role. Allowed roles are: ${validRoles.join(', ')}`,
        });
        return;
      }
      req.body.role = roleUpperCase as Role;
    }

    if (!req.file) {
      req.body.image =
        'https://twgylixpgrmkadqpawsh.supabase.co/storage/v1/object/public/images/public/user_default/user-profile.webp';
    } else {
      const { imageUrl } = await uploadToLocal(req);
      req.body.image = imageUrl;
    }

    next();
  } catch (error) {
    next(error);
  }
};
