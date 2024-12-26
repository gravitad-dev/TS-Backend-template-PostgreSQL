import { Router } from 'express';
import { PaymentController } from './payment.controller';

const router = Router();

router.post('/', PaymentController.createPaymentIntent);
router.get('/sales-by-day', PaymentController.getSalesByLast7Day);
router.get('/sales-this-month', PaymentController.getSalesThisMonth);
router.get('/total-sales', PaymentController.getTotalSales);
router.get('/total-revenue', PaymentController.getTotalRevenue);
router.get('/sales-by-month', PaymentController.getSalesByMonth);
router.get('/revenue-by-month', PaymentController.getRevenueByMonth);
router.get('/:id', PaymentController.getPaymentById);

export default router;
