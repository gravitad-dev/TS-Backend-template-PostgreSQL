import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service';

export const categoryController = {
  async createCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const newCategory = await categoryService.createCategory(req.body);
      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  },
  async getAllcategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  },
  async getCategoryById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await categoryService.getCategoryById(
        parseInt(req.params.id)
      );
      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  },
  async updateCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await categoryService.updateCategory(
        parseInt(req.params.id),
        req.body
      );
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  },
  async deleteCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = await categoryService.getCategoryById(
        parseInt(req.params.id)
      );

      if (!category) {
        res.status(404).json({ message: 'Category not found' });
        return;
      }

      await categoryService.deleteCategory(parseInt(req.params.id));
      res
        .status(200)
        .json({ message: 'Category deleted successfully', category });
    } catch (error) {
      next(error);
    }
  },
};
