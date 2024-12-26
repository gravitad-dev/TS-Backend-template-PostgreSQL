import { Router } from 'express';
import { buyerController } from './buyer.controller';

const router = Router();

router.get('/', buyerController.getAllBuyers);
router.get('/:id', buyerController.getbuyerById);
router.put('/:id', buyerController.updateBuyer);
router.post('/', buyerController.createBuyer);
router.delete('/:id', buyerController.deleteBuyer);

export default router;
