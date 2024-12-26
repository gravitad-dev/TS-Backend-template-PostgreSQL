import { PrismaClient, Category as CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

export const Category = {
  async create(data: Omit<CategoryType, 'id'>) {
    return await prisma.category.create({ data });
  },
  async findAll() {
    return await prisma.category.findMany();
  },
  async findById(id: number) {
    return await prisma.category.findUnique({ where: { id } });
  },
  async update(id: number, data: Partial<Omit<CategoryType, 'id'>>) {
    return await prisma.category.update({ where: { id }, data });
  },
  async delete(id: number) {
    return await prisma.category.delete({ where: { id } });
  },
};
