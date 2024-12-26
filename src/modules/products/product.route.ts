import { Router } from 'express';
import { productController } from './product.controller';
import { upload } from '../../hooks';
import { sanitizeMiddleware } from '../../middlewares';

const productsPrivateRouter = Router();
const productsPublicRouter = Router();

// PUBLICS ROUTES
productsPublicRouter.get('/recommended', productController.getProductsRecommended);
productsPublicRouter.get('/category', productController.getProductByCategory);
productsPublicRouter.get('/sortedDate', productController.getProductsSortedByDate);
productsPublicRouter.get('/categorySortedDate', productController.getProductsByCategoryAndSortedByDate);
productsPublicRouter.get('/filter', productController.getFilteredProducts);
productsPublicRouter.get('/', productController.getAllProducts);
productsPublicRouter.get('/:id', productController.getProductById);

// PRIVATE ROUTES
productsPrivateRouter.get('/admin/non-stock', productController.getProductsWithoutStock);
productsPrivateRouter.get('/admin/amount', productController.getProductsAmount);
productsPrivateRouter.delete('/:id', productController.deleteProduct);
productsPrivateRouter.post('/', upload.single('image'), sanitizeMiddleware, productController.createProduct);
productsPrivateRouter.put('/:id', upload.single('image'), sanitizeMiddleware, productController.updateProduct);

export { productsPrivateRouter, productsPublicRouter };
