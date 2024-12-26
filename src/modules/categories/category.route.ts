import { Router } from 'express';
import { categoryController } from './category.controller';

const router = Router();

router.post('/',categoryController.createCategory)
router.get('/', categoryController.getAllcategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;