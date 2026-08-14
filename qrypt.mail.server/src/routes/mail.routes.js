import { Router } from 'express';
import { getInbox, getMessage, sendMessage, getAttachment } from '../controllers/mail.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';
import { z } from 'zod';

const router = Router();

// Zod schema for validating the sendMessage payload
const sendMailSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid sender email address'),
        to: z.array(z.string().email('Invalid recipient email address')).nonempty('At least one recipient is required'),
        cc: z.array(z.string().email('Invalid CC email address')).optional().default([]),
        bcc: z.array(z.string().email('Invalid BCC email address')).optional().default([]),
        subject: z.string().default(''),
        body: z.string().default(''),
        attachments: z.array(z.object({
            filename: z.string(),
            mimeType: z.string(),
            content: z.string()
        })).optional().default([])
    })
});

// Protect all routes within the mail router
router.use(protect);

// Mail operations routes
router.get('/inbox', getInbox);
router.get('/messages/:id', getMessage);
router.get('/messages/:messageId/attachments/:attachmentId', getAttachment);
router.post('/send', validateRequest(sendMailSchema), sendMessage);

export default router;
