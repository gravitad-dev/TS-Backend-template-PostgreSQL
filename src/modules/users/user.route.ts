import { Router } from 'express';
import { userController } from './user.controller';

const userPrivateRouter = Router();
const userPublicRouter = Router();

// Private Routes
userPrivateRouter.get('/', userController.getAllUsers);
userPrivateRouter.get('/current', userController.getCurrentUser);
userPrivateRouter.get('/name', userController.getUsersByName);
userPrivateRouter.get('/status', userController.getUsersByStatus);
userPrivateRouter.get('/email', userController.getUsersByEmail);
userPrivateRouter.get('/:id', userController.getUserById);
userPrivateRouter.put('/:id', userController.updateUser);
userPrivateRouter.delete('/:id', userController.deleteUser);

// Public Routes
userPublicRouter.post('/verify', userController.verifyUser);

export { userPublicRouter, userPrivateRouter };
