// cartProduct.controller.ts
import { Request, Response, NextFunction } from 'express';
import { cartProductService } from './cartProduct.service';

export const cartProductController = {
  async addProductToCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { productId, quantity } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      if (!productId || !quantity) {
        res
          .status(400)
          .json({ message: 'productId and quantity are required' });
        return;
      }

      await cartProductService.addProductToCart(userId, productId, quantity);
      res.status(200).json({ message: 'Product added to cart' });
    } catch (error: any) {
      res.status(400).json({ message: `Error: ${error.message}` });
      return;
    }
  },

  async removeProductFromCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { productId } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      if (!productId) {
        res.status(400).json({ message: 'productId is required' });
        return;
      }

      await cartProductService.removeProductFromCart(userId, productId);
      res.status(200).json({ message: 'Product removed from cart' });
    } catch (error: any) {
      res.status(400).json({ message: `Error: ${error.message}` });
      return;
    }
  },

  async updateProductQuantity(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { productId, quantity } = req.body;

      if (!userId) {
        res.status(401).json({ message: 'User not authenticated' });
        return;
      }

      if (!productId || quantity === undefined) {
        res
          .status(400)
          .json({ message: 'productId and quantity are required' });
        return;
      }

      await cartProductService.updateProductQuantity(
        userId,
        productId,
        quantity
      );
      res.status(200).json({ message: 'Quantity updated' });
    } catch (error: any) {
      res.status(400).json({ message: `Error: ${error.message}` });
      return;
    }
  },
};
