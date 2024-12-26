import { PrismaClient, User as UserType } from '@prisma/client';

const prisma = new PrismaClient();

export const User = {
  async create(data: Omit<UserType, 'id'>) {
    return await prisma.user.create({ data });
  },
  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  },
  async findUserByUsername(username: string) {
    return await prisma.user.findUnique({ where: { username } });
  },
  async findAll(limit: number, offset: number) {
    return await prisma.user.findMany({
      skip: offset,
      take: limit,
    });
  },
  async count() {
    return await prisma.user.count();
  },
  async findByName(name: string) {
    return await prisma.user.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  },
  async findByStatus(active: boolean) {
    return await prisma.user.findMany({
      where: {
        active,
      },
    });
  },
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  },
  async findById(id: number) {
    return await prisma.user.findUnique({ where: { id } });
  },
  async update(id: number, data: Partial<Omit<UserType, 'id'>>) {
    return await prisma.user.update({ where: { id }, data });
  },
  async delete(id: number) {
    return await prisma.user.delete({ where: { id } });
  },
};
