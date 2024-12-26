import { PrismaClient, CartProduct as CartProductType } from '@prisma/client';

const prisma = new PrismaClient();

export const CartProduct = {
  async create(data: Omit<CartProductType, 'id'>) {
    return await prisma.cartProduct.create({ data });
  },
  async update(id: number, data: Partial<Omit<CartProductType, 'id'>>) {
    return await prisma.cartProduct.update({ where: { id }, data });
  },
  async delete(id: number) {
    return await prisma.cartProduct.delete({ where: { id } });
  },
  async findByCartIdAndProductId(cartId: number, productId: number) {
    return await prisma.cartProduct.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });
  },
};
