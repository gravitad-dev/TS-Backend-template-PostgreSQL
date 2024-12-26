import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { cartService } from '../carts/cart.service';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from '../emails/email.service';
import { verificationEmailTemplate } from './emaiTemplate';

const excludePassword = (user: any) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const userController = {
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const verificationCode = crypto.randomInt(100000, 999999).toString();
      const hashedCode = await bcrypt.hash(verificationCode, 10);

      const user = await userService.createUser({
        ...req.body,
        active: false,
        verificationCode: hashedCode,
      });

      const emailContent = verificationEmailTemplate(user.name || user.username, verificationCode);

      await sendEmail(user.email, 'Verification Code', emailContent);

      const newCart = await cartService.createCart({
        userId: user.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });

      res.status(201).json({
        message: 'User created successfully. Please verify your email.',
        user: excludePassword(user),
        cart: newCart,
      });
    } catch (error: any) {
      if (error.message.includes('Email already exists')) {
        res.status(400).json({ message: 'User with this email already exists' });
        return;
      } else if (error.message.includes('Username already exists')) {
        res.status(400).json({ message: 'User with this username already exists' });
        return;
      }
      next(error);
    }
  },

  async verifyUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        res.status(400).json({ message: 'Email and code are required' });
        return;
      }

      const user = await userService.getUsersByEmail(email);

      if (user.active) {
        res.status(400).json({ message: 'User is already active' });
        return;
      }

      if (user.verificationCode && !(await bcrypt.compare(code, user.verificationCode))) {
        res.status(400).json({ message: 'Invalid verification code' });
        return;
      }
      const data = { active: true, verificationCode: null };
      const userActivated = await userService.updateUser(user.id, data);

      res.status(200).json({ message: 'User successfully verified', user: excludePassword(userActivated) });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        res.status(404).json({ message: 'User not found' });
      }
      next(error);
    }
  },

  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const { users, totalUsers } = await userService.getAllUsers(page, limit);
      const usersWithoutPasswords = users.map(excludePassword);

      res.status(200).json({
        pagination: {
          totalUsers,
          totalPages: Math.ceil(totalUsers / limit),

          currentPage: page,
        },
        users: usersWithoutPasswords,
      });
    } catch (error: any) {
      next(error);
    }
  },

  async getUsersByName(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name } = req.query;
      const users = await userService.getUsersByName(name as string);
      const usersWithOrdersCount = users.map(excludePassword);
      res.status(200).json(usersWithOrdersCount);
    } catch (error: any) {
      next(error);
    }
  },

  async getUsersByStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const active = req.query.active === 'true';
      const users = await userService.getUsersByStatus(active);
      const usersWithOrdersCount = users.map(excludePassword);
      res.status(200).json(usersWithOrdersCount);
    } catch (error: any) {
      next(error);
    }
  },

  async getUsersByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.query;
      const user = await userService.getUsersByEmail(email as string);
      if (user) {
        res.status(200).json(excludePassword(user));
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error: any) {
      if (error.message.includes('User not found')) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(500).json({ message: error.message });
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }
      const user = await userService.getUserById(id);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      res.status(200).json({
        ...excludePassword(user),
        ordersCount: user.ordersCount,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }
      const updatedUser = await userService.updateUser(id, req.body);
      res.status(200).json({
        message: 'User successfully updated',
        updatedUser: excludePassword(updatedUser),
      });
    } catch (error: any) {
      if (error.message.includes('must be at least 8')) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: error.message });
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ message: 'Invalid ID format' });
        return;
      }

      const userExists = await userService.getUserById(id);
      if (!userExists) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      await userService.deleteUser(id);

      res.status(200).json({
        message: 'User removed successfully',
        user: excludePassword(userExists),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' });
        return;
      }

      const userData = await userService.login(username, password);

      res.status(200).json(excludePassword(userData));
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({ message: error.message });
          return;
        } else if (error.message === 'User is disabled') {
          res.status(403).json({ message: error.message });
          return;
        } else if (error.message === 'Invalid password') {
          res.status(401).json({ message: error.message });
          return;
        } else {
          res.status(500).json({ message: error.message });
        }
      } else {
        res.status(500).json({ message: 'An unexpected error occurred' });
      }
    }
  },

  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const currentUser = req.user
      if (currentUser) {
        const user = await userService.getUserById(currentUser.id);
        res.status(200).json({
          ...excludePassword(user),
          ordersCount: user.ordersCount,
        });
      } else {
        res.status(400).json({ message: "There is no active user." });
      }
    } catch (error: any) {
      next(error);
    }
  },

};
