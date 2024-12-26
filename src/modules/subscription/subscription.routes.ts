import { Router } from 'express';
import {
  handleCreateSubscription,
  handleGetSubscriptions,
  handleDeleteSubscription,
  handleGetSubscriptionByEmail,
  handleGetSubscriptionById,
  handleEditSubscription,
  handleSendBulk,
} from './subscription.controller';
import { sanitizeMiddleware } from '../../middlewares';

const router = Router();

router.get('/', handleGetSubscriptions);
router.get('/email', handleGetSubscriptionByEmail);
router.get('/:id', handleGetSubscriptionById);
router.delete('/:id', handleDeleteSubscription);
router.post('/', handleCreateSubscription);
router.put('/:id', handleEditSubscription);
router.post('/send-bulk', sanitizeMiddleware, handleSendBulk);

export default router;
