import { Router } from 'express';
import { userPrivateRouter } from '../modules/users/user.route';
import { productsPrivateRouter } from '../modules/products/product.route';
import { articlesPrivateRouter } from '../modules/articles/article.route';
import { suggestedPrivateRouter } from '../modules/suggested/suggested.route';
import categoryRouter from '../modules/categories/category.route';
import cartRouter from '../modules/carts/cart.route';
import paymentRoutes from '../modules/payments/stripe/payment.routes';
import cryptoPayment from '../modules/payments/crypto/verify-transaction';
import orderRoutes from '../modules/orders/order.routes';
import buyerRoutes from '../modules/buyer/buyer.routes';
import logsRouter from '../modules/logs/logs.route';
import { roleMiddleware } from '../middlewares';

const router = Router();

router.use('/users', userPrivateRouter);
router.use('/articles', articlesPrivateRouter);
router.use('/products', productsPrivateRouter);
router.use('/carts', cartRouter);
router.use('/payments', paymentRoutes);
router.use('/crypto-payment', cryptoPayment);
router.use('/categories', categoryRouter);
router.use('/orders', orderRoutes);
router.use('/buyers', buyerRoutes);
router.use('/suggested',suggestedPrivateRouter)
router.use('/superadmin', roleMiddleware(['SUPERADMIN']), logsRouter);

//************************************************** */
//? TEST OF VERIFIED ROUTES BY USER ROLES

router.get('/dashboard', roleMiddleware(['ADMIN', 'SUPERADMIN']), (_req, res) => {
  res.send('Welcome to the dashboard');
});

router.get('/superadmin', roleMiddleware(['SUPERADMIN']), (_req, res) => {
  res.send('Welcome, superadmin!');
});

router.get('/profile', roleMiddleware(['USER', 'ADMIN', 'SUPERADMIN']), (_req, res) => {
  res.send('Welcome to your profile');
});
//************************************************** */

export const privateRouter = router;
