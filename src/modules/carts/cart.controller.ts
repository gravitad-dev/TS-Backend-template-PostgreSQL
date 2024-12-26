import { Request, Response, NextFunction } from 'express';
import { cartService } from './cart.service';

export const cartController = {
  async createCart(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const newCart = await cartService.createCart(req.body);
      res.status(201).json(newCart);
    } catch (error) {
      next(error);
    }
  },
  async getAllcarts(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const carts = await cartService.getAllCart();
      res.status(200).json(carts);
    } catch (error) {
      next(error);
    }
  },
  async getCartById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cart = await cartService.getCartById(parseInt(req.params.id));
      if (!cart) {
        res.status(404).json({ message: 'Cart not found' });
        return;
      }
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  },
  async getCartByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user?.id;

      const cart = await cartService.getCartByUserId(parseInt(userId));
      if (!cart) {
        res.status(404).json({ message: 'Cart not found' });
        return;
      }
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  },
  async updateCart(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cart = await cartService.updateCart(
        parseInt(req.params.id),
        req.body
      );
      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  },
  async deleteCart(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await cartService.deleteCart(parseInt(req.params.id));
      res.status(204).send({ message: 'Cart deleted' });
    } catch (error) {
      next(error);
    }
  },
  async emptyCart(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      await cartService.emptyACart(parseInt(req.user?.id));
      res.status(200).send({ message: 'Empty Cart' });
    } catch (error) {
      next(error);
    }
  },
};
