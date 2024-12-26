import { Cart } from './cart.model';

export const cartService = {
  async createCart(data: { userId: number; createdAt: Date; updatedAt: Date }) {
    return Cart.create(data);
  },
  async getAllCart() {
    return Cart.findAll();
  },
  async getCartById(id: number) {
    return Cart.findById(id);
  },
  getCartByUserId: async (userId: number) => {
    return Cart.findByUserId(userId);
  },
  async updateCart(
    id: number,
    data: Partial<{
      userId: number;
      products: string;
      createdAt: Date;
      updatedAt: Date;
    }>
  ) {
    return Cart.update(id, data);
  },
  async deleteCart(id: number) {
    return Cart.delete(id);
  },
  async emptyACart(userId: number) {
    return Cart.empty(userId);
  },
};
