import MailService from '../services/mail.service.js';

/**
 * Fetch list of inbox emails for the authenticated user's mail connection
 */
export const getInbox = async (req, res, next) => {
    try {
        const { email, folder, limit, pageToken } = req.query;
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                error: { code: 'INVALID_REQUEST', message: 'Query parameter "email" is required.' } 
            });
        }
        
        const messages = await MailService.getInbox(req.user.id, email, { 
            folder, 
            limit: limit ? parseInt(limit, 10) : 20,
            pageToken
        });
        res.json({
            success: true,
            data: {
                messages,
                nextPageToken: messages.nextPageToken || null
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Fetch detailed body and headers of a specific email
 */
export const getMessage = async (req, res, next) => {
    try {
        const { email } = req.query;
        const { id } = req.params;
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                error: { code: 'INVALID_REQUEST', message: 'Query parameter "email" is required.' } 
            });
        }

        const message = await MailService.getMessage(req.user.id, email, id);
        res.json({
            success: true,
            data: { message }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Send an email message
 */
export const sendMessage = async (req, res, next) => {
    try {
        const { email, to, cc, bcc, subject, body, attachments } = req.body;
        const result = await MailService.sendMessage(req.user.id, email, { to, cc, bcc, subject, body, attachments });
        res.json({
            success: true,
            message: "Email sent successfully!",
            data: result
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Fetch and stream a specific email attachment
 */
export const getAttachment = async (req, res, next) => {
    try {
        const { email } = req.query;
        const { messageId, attachmentId } = req.params;
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                error: { code: 'INVALID_REQUEST', message: 'Query parameter "email" is required.' } 
            });
        }

        // 1. Fetch message metadata first to resolve filename and mimetype
        const message = await MailService.getMessage(req.user.id, email, messageId);
        const attachmentMeta = message.attachments?.find(att => att.id === attachmentId);

        const filename = attachmentMeta ? attachmentMeta.filename : 'attachment';
        const contentType = attachmentMeta ? attachmentMeta.mimeType : 'application/octet-stream';

        // 2. Fetch the stream from the provider
        const stream = await MailService.getAttachment(req.user.id, email, messageId, attachmentId);

        // 3. Set standard response headers for binary attachment downloading
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
        res.setHeader('Content-Type', contentType);

        // 4. Pipe stream directly to HTTP client
        stream.pipe(res);
    } catch (err) {
        next(err);
    }
};
