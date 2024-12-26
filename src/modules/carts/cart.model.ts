import { PrismaClient, Cart as CartType } from '@prisma/client';

const prisma = new PrismaClient();

export const Cart = {
  async create(data: Omit<CartType, 'id'>) {
    return await prisma.cart.create({ data });
  },
  async findAll() {
    return await prisma.cart.findMany();
  },
  async findById(id: number) {
    return await prisma.cart.findUnique({ where: { id } });
  },
  async findByUserId(userId: number) {
    return await prisma.cart.findUnique({
      where: { userId },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  },
  async update(id: number, data: Partial<Omit<CartType, 'id'>>) {
    return await prisma.cart.update({ where: { id }, data });
  },
  async delete(id: number) {
    return await prisma.cart.delete({ where: { id } });
  },
  async empty(userId: number) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartProduct.deleteMany({ where: { cartId: cart.id } });
    } else {
      throw new Error('The cart does not exist for this user');
    }
  },
};
