// cartProduct.service.ts
import { CartProduct } from './cartProduct.model';
import prisma from '../../config/database';
import { productService } from '../../modules/products/product.service';

export const cartProductService = {
  async addProductToCart(userId: number, productId: number, quantity: number) {
    // Verify that the product exists
    const product = await productService.getProductById(productId);
    if (!product) {
      throw new Error(`Product with id ${productId} does not exist`);
    }

    if (product.stock < quantity) {
      throw new Error(
        `Quantity ${quantity} exceeds stock ${product.stock} of the product`
      );
    }
    // Get or create the user's cart
    let cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    // Check if the product is already in the cart
    const existingCartProduct = await CartProduct.findByCartIdAndProductId(
      cart.id,
      productId
    );

    if (existingCartProduct) {
      // Update the quantity
      return await CartProduct.update(existingCartProduct.id, {
        quantity: existingCartProduct.quantity + quantity,
      });
    } else {
      // Add new product to the cart
      return await CartProduct.create({
        cartId: cart.id,
        productId,
        quantity,
      });
    }
  },

  async removeProductFromCart(userId: number, productId: number) {
    // Get the user's cart
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new Error('Cart does not exist for this user');
    }

    // Find the product in the cart
    const cartProduct = await CartProduct.findByCartIdAndProductId(
      cart.id,
      productId
    );

    if (cartProduct) {
      await CartProduct.delete(cartProduct.id);
    } else {
      throw new Error('Product is not in the cart');
    }
  },

  async updateProductQuantity(
    userId: number,
    productId: number,
    quantity: number
  ) {
    // Get the user's cart
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      throw new Error('Cart does not exist for this user');
    }

    // Find the product in the cart
    const cartProduct = await CartProduct.findByCartIdAndProductId(
      cart.id,
      productId
    );

    if (cartProduct) {
      if (quantity <= 0) {
        // If the quantity is zero or negative, remove the product from the cart
        await CartProduct.delete(cartProduct.id);
      } else {
        // Update the quantity
        await CartProduct.update(cartProduct.id, { quantity });
      }
    } else {
      throw new Error('Product is not in the cart');
    }
  },
};
