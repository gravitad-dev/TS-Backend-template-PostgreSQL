import { Router } from 'express';
import { userPrivateRouter } from '../modules/users/user.route';
import paymentRoutes from '../modules/payments/stripe/payment.routes';
import { roleMiddleware } from '../middlewares';

const router = Router();

router.use('/users', userPrivateRouter);
router.use('/payments', paymentRoutes);

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
