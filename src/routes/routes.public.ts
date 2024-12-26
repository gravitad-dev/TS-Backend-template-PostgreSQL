import { Router } from 'express';
import { validateUserData } from '../middlewares';
import { upload } from '../hooks';
import { userController } from '../modules/users/user.controller';
import { userPublicRouter } from '../modules/users/user.route';
import { imageRouter } from '../modules/images/image.route';
import { articlesPublicRouter } from '../modules/articles/article.route';
import { productsPublicRouter } from '../modules/products/product.route';
import { suggestedPublicRouter } from '../modules/suggested/suggested.route';
import emailRouter from '../modules/emails/email.routes';
import subscriptionRouter from '../modules/subscription/subscription.routes';
import { requestPasswordReset, resetPassword } from '../modules/users/resetPassword/auth.controller';
const router = Router();

router.use('/request-password-reset', requestPasswordReset);
router.use('/reset-password', resetPassword);
router.use('/images', imageRouter);
router.post('/register', upload.single('image'), validateUserData, userController.createUser);
router.post('/login', userController.login);
router.use('/users', userPublicRouter);
router.use('/articles', articlesPublicRouter);
router.use('/products', productsPublicRouter);
router.use('/emails', emailRouter);
router.use('/subscriptions', subscriptionRouter);
router.use('/suggested',suggestedPublicRouter)

export const publicRouter = router;
