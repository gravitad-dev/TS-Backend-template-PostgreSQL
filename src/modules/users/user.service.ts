import { User } from './user.model';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const userService = {
  async createUser(data: {
    email: string;
    password: string;
    active: boolean;
    verificationCode: string;
    name: string;
    role: Role;
    username: string;
    image: string;
    phone: string;
  }) {
    const { email, username, password } = data;

    const existingUserByEmail = await User.findUserByEmail(email);
    const existingUserByUsername = await User.findUserByUsername(username);

    if (existingUserByEmail) {
      throw new Error('Email already exists');
    }

    if (existingUserByUsername) {
      throw new Error('Username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        ...data,
        password: passwordHash,
        active: false,
      },
    });

    return newUser;
  },

  async getAllUsers(page: number, limit: number) {
    const offset = (page - 1) * limit;
    const users = await User.findAll(limit, offset);
    const totalUsers = await User.count();

    const usersWithOrdersCount = await Promise.all(
      users.map(async (user) => {
        const ordersCount = await prisma.order.count({
          where: { userId: user.id },
        });
        return {
          ...user,
          ordersCount,
        };
      })
    );

    return { users: usersWithOrdersCount, totalUsers };
  },

  async getUsersByName(name: string) {
    const users = await User.findByName(name);

    const usersWithOrdersCount = await Promise.all(
      users.map(async (user) => {
        const ordersCount = await prisma.order.count({
          where: { userId: user.id },
        });
        return {
          ...user,
          ordersCount,
        };
      })
    );

    return usersWithOrdersCount;
  },

  async getUsersByStatus(active: boolean) {
    const users = await User.findByStatus(active);

    const usersWithOrdersCount = await Promise.all(
      users.map(async (user) => {
        const ordersCount = await prisma.order.count({
          where: { userId: user.id },
        });
        return {
          ...user,
          ordersCount,
        };
      })
    );

    return usersWithOrdersCount;
  },

  async getUsersByEmail(email: string) {
    const user = await User.findByEmail(email);
    if (!user) throw new Error('User not found');

    const ordersCount = await prisma.order.count({
      where: { userId: user.id },
    });

    return {
      ...user,
      ordersCount,
    };
  },

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const ordersCount = await prisma.order.count({
      where: { userId: id },
    });

    return {
      ...user,
      ordersCount,
    };
  },

  async updateUser(
    id: number,
    data: Partial<{
      email: string;
      name: string;
      password: string;
      username: string;
      active: boolean;
      verificationCode: string | null;
    }>
  ) {
    const existingUserByEmail = data.email ? await User.findUserByEmail(data.email) : null;
    const existingUserByUsername = data.username ? await User.findUserByUsername(data.username) : null;

    if (existingUserByEmail && existingUserByEmail.id !== id) {
      throw new Error('Email already exists');
    }

    if (existingUserByUsername && existingUserByUsername.id !== id) {
      throw new Error('Username already exists');
    }

    if (data.password) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
      if (!passwordRegex.test(data.password)) {
        throw new Error(
          'The new password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
        );
      }
      const passwordHash = await bcrypt.hash(data.password, 10);
      data.password = passwordHash;
    }

    const updatedUser = await User.update(id, {
      ...data,
      updatedAt: new Date(),
    });

    return updatedUser;
  },

  async deleteUser(id: number) {
    try {
      await User.delete(id);
    } catch (error) {
      throw new Error('Could not delete user');
    }
  },

  async login(username: string, password: string) {
    const user = await User.findUserByUsername(username);
    if (!user) throw new Error('User not found');
    if (user.active === false) throw new Error('User is disabled');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');

    const token = this.generateJwtToken(user);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      imageURL: user.image,
      username: user.username,
      role: user.role,
      token,
    };
  },

  generateJwtToken(user: { id: number; username: string; role: string }) {
    return jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });
  },
};
