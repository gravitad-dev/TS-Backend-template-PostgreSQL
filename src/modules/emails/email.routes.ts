import { Router } from 'express';
import { handleSendEmail, handleSendBulkEmail } from './email.controller';
import { sanitizeMiddleware } from '../../middlewares';

const router = Router();

// Route to send a single email
router.post('/send', sanitizeMiddleware, handleSendEmail);

// Route to send bulk emails
router.post('/send-bulk', sanitizeMiddleware, handleSendBulkEmail);

export default router;
