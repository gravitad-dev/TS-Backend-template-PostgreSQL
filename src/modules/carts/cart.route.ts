import { Router } from 'express';
import { cartController } from './cart.controller';
import { cartProductController } from './cartProduct.controller';

const router = Router();

router.post('/', cartController.createCart);
router.get('/', cartController.getAllcarts);
router.get('/user', cartController.getCartByUserId);
router.get('/:id', cartController.getCartById);
router.put('/:id', cartController.updateCart);
router.put('/empty', cartController.emptyCart);
router.delete('/:id', cartController.deleteCart);

router.post('/products/add', cartProductController.addProductToCart);
router.delete('/products/remove', cartProductController.removeProductFromCart);
router.put('/products/update', cartProductController.updateProductQuantity);

export default router;
