import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';
import { Status_Product, Product, ProductType } from '@prisma/client';
import { uploadToLocal, buildProductFilters } from '../../utils';
import { validateCreateProduct, validateUpdateProduct } from './product.validator';

export const productController = {
  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!req.file) {
      res.status(400).json({ message: 'Image is required' });
      return;
    }

    const errors = validateCreateProduct(req.body);
    if (errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    try {
      const { categoryId } = req.body;

      const imageUrlUpload = await uploadToLocal(req);

      const imageUrl = imageUrlUpload?.imageUrl;

      const product = await productService.createProduct({
        ...req.body,
        image: imageUrl,
        categoryId: Number(categoryId),
        status: req.body.status.toUpperCase() as Status_Product,
        productType: req.body.productType.toUpperCase() as ProductType,
        regularPrice: parseFloat(req.body.regularPrice),
        offerPrice: req.body.offerPrice ? parseFloat(req.body.offerPrice) : null,
        stock: parseInt(req.body.stock, 10),
      });

      res.status(201).json(product);
    } catch (error) {
      if (!res.headersSent) {
        return next(error);
      } else {
        console.error('Error while processing the request:', error);
      }
    }
  },

  async getFilteredProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
      const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 10;
      const sortBy = (req.query.sortBy as 'date' | 'price') || 'date';
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

      const validStatuses = ['ACTIVE', 'DISABLED'];
      const validProductTypes = ['PHYSICAL', 'NONPHYSICAL'];
      const validSortFields = ['date', 'price'];

      req.query.status = req.query.status?.toString().toUpperCase();
      req.query.productType = req.query.productType?.toString().toUpperCase();

      if (req.query.status && !validStatuses.includes(req.query.status as string)) {
        res.status(400).json({
          error: `Invalid status value: ${req.query.status}. Allowed values are: ${validStatuses.join(', ')}.`,
        });
        return;
      }

      if (req.query.productType && !validProductTypes.includes(req.query.productType as string)) {
        res.status(400).json({
          error: `Invalid productType value: ${req.query.productType}. Allowed values are: ${validProductTypes.join(
            ', '
          )}.`,
        });
        return;
      }

      if (sortBy && !validSortFields.includes(sortBy)) {
        res.status(400).json({
          error: `Invalid sortBy value: ${sortBy}. Allowed values are: ${validSortFields.join(', ')}.`,
        });
        return;
      }

      const filters = buildProductFilters(req.query);

      const skip = (page - 1) * limit;
      const take = limit;

      const { products, totalProducts } = await productService.findProductsFiltered(
        filters,
        skip,
        take,
        sortBy,
        sortOrder
      );

      const totalPages = Math.ceil(totalProducts / limit);

      res.status(200).json({
        totalProducts: totalProducts,
        totalPages,
        currentPage: page,
        limitPerPage: limit,
        products: products,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const skip = (page - 1) * limit;

      const products = await productService.getPaginatedProducts(limit, skip);

      const totalProducts = await productService.getCountProducts();

      res.status(200).json({
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        products,
      });
    } catch (error) {
      next(error);
    }
  },

  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getProductById(parseInt(req.params.id));
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
      const categoryId = Number(product?.categoryId) || 1;
      const recommend = await productService.findProductsByCategory(categoryId);
      const filteredRecommended = recommend.filter((p) => p.id !== product.id);
      res.status(200).json({ product, productRecommend: filteredRecommended });
    } catch (error) {
      next(error);
    }
  },

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validateUpdateProduct(req.body);
      if (errors.length > 0) {
        res.status(400).json({ errors });
        return;
      }
      if (req.file) {
        const imageUrlUpload = await uploadToLocal(req);
        const imageUrl = imageUrlUpload?.imageUrl;
        req.body.image = imageUrl;
      }

      const product = await productService.updateProduct(parseInt(req.params.id), req.body);
      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  },

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const result = await productService.deleteProduct(Number(id));
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getProductsWithoutStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getAllProducts();
      const productsFiltered = products.filter((product) => product.stock <= 0);
      res.status(200).send(productsFiltered);
    } catch (error) {
      next(error);
    }
  },

  async getProductByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { categoryId } = req.query;
    try {
      const products = await productService.getAllProducts();
      const filteredProducts = products.filter((product) => product.categoryId === Number(categoryId));

      res.status(200).send({ category: categoryId, products: filteredProducts });
    } catch (error) {
      next(error);
    }
  },

  async getProductsAmount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getAllProducts();
      res.status(200).send({ productsTotal: products.length });
    } catch (error) {
      next(error);
    }
  },

  async getProductsSortedByDate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { order } = req.query;

    try {
      const sortOrder = typeof order === 'string' ? order : 'desc';
      const productsSorted = await productService.SortedByDate(sortOrder);
      res.status(200).send({ order: sortOrder, products: productsSorted });
    } catch (error) {
      next(error);
    }
  },

  async getProductsByCategoryAndSortedByDate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { categoryId, order } = req.query;

    try {
      const sortOrder = typeof order === 'string' ? order : 'desc';
      const products = await productService.getAllProducts();

      const filteredProducts = categoryId
        ? products.filter((product) => product.categoryId === Number(categoryId))
        : products;

      const sortedProducts = filteredProducts.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });

      res.status(200).send({
        category: categoryId || 'all',
        order: sortOrder,
        products: sortedProducts,
      });
    } catch (error) {
      next(error);
    }
  },

  async getProductsRecommended(req: Request, res: Response, next: NextFunction) {
    try {
      const recommendedProducts: Partial<Product>[] = await productService.getRandomProducts();

      res.status(200).json(recommendedProducts);
    } catch (error) {
      next(error);
    }
  },
};
