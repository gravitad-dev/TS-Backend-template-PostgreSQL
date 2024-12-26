import { Router } from 'express';
import { orderController } from './order.controller';

const router = Router();

router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrder);
router.get('/searchOrders', orderController.searchOrders);
router.get('/metrics', orderController.getMetrics);
router.get('/user-logged', orderController.getOrdersByUserLogged);
router.get('/:id', orderController.getOrderById);
router.get('/user/:userId', orderController.getOrdersByUser);
router.get('/user/:userId/search', orderController.getOrdersByUserWithFilters);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id', orderController.updateOrderById);
router.post('/invoice/:id', orderController.generateInvoice);

export default router;
