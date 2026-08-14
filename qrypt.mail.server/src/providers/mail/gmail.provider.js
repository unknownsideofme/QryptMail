import { google } from 'googleapis';
import MailProvider from './mailProvider.js';

export default class GmailProvider extends MailProvider {
    constructor() {
        super();
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    /**
     * Get configured Google Gmail Client
     * @param {string} accessToken 
     */
    #getGmailClient(accessToken) {
        this.oauth2Client.setCredentials({ access_token: accessToken });
        return google.gmail({ version: 'v1', auth: this.oauth2Client });
    }

    /**
     * Fetch list of inbox emails with header metadata
     */
    async getInbox(accessToken, options = {}) {
        const gmail = this.#getGmailClient(accessToken);
        const maxResults = options.limit || 50;
        
        let query = 'label:INBOX';
        if (options.folder) {
            const folder = options.folder.toLowerCase();
            if (folder === 'sent') {
                query = 'label:SENT';
            } else if (folder === 'drafts') {
                query = 'label:DRAFT';
            } else if (folder === 'trash') {
                query = 'label:TRASH';
            } else if (folder === 'starred') {
                query = 'is:starred';
            }
        }
        
        const listParams = {
            userId: 'me',
            q: query,
            maxResults
        };
        if (options.pageToken) {
            listParams.pageToken = options.pageToken;
        }

        // 1. Fetch message list
        const listRes = await gmail.users.messages.list(listParams);

        const messagesList = listRes.data.messages || [];
        
        // 2. Fetch headers and details in parallel
        const messages = await Promise.all(
            messagesList.map(async (msg) => {
                try {
                    const detail = await gmail.users.messages.get({
                        userId: 'me',
                        id: msg.id,
                        format: 'metadata',
                        metadataHeaders: ['Subject', 'From', 'Date', 'Content-Type']
                    });
                    
                    const headers = detail.data.payload.headers || [];
                    const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
                    const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
                    const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
                    const contentType = headers.find(h => h.name.toLowerCase() === 'content-type')?.value || '';
                    
                    const labelIds = detail.data.labelIds || [];
                    const isUnread = labelIds.includes('UNREAD');
                    const starred = labelIds.includes('STARRED');
                    const hasAttachments = !!(contentType.includes('mixed') || detail.data.payload.mimeType?.includes('mixed'));
                    
                    return {
                        id: msg.id,
                        threadId: msg.threadId,
                        from,
                        subject,
                        date,
                        snippet: detail.data.snippet || '',
                        isUnread,
                        starred,
                        hasAttachments,
                        attachmentCount: hasAttachments ? 1 : 0
                    };
                } catch (err) {
                    return { id: msg.id, error: err.message };
                }
            })
        );

        const messagesArray = messages.filter(msg => !msg.error);
        messagesArray.nextPageToken = listRes.data.nextPageToken || null;
        return messagesArray;
    }

    /**
     * Fetch full email body and attachment indices
     */
    async getMessage(accessToken, messageId) {
        const gmail = this.#getGmailClient(accessToken);
        const res = await gmail.users.messages.get({
            userId: 'me',
            id: messageId
        });

        const payload = res.data.payload;
        const headers = payload.headers || [];
        const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '';
        const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || '';
        const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || '';
        const date = headers.find(h => h.name.toLowerCase() === 'date')?.value || '';
        const cc = headers.find(h => h.name.toLowerCase() === 'cc')?.value || '';
        const bcc = headers.find(h => h.name.toLowerCase() === 'bcc')?.value || '';

        // Extract email body text recursively
        const getBody = (parts) => {
            if (!parts) return '';
            
            // Prioritize html for rich rendering
            for (const part of parts) {
                if (part.mimeType === 'text/html' && part.body && part.body.data) {
                    return Buffer.from(part.body.data, 'base64url').toString('utf-8');
                }
            }
            
            // Fallback check for plain text
            for (const part of parts) {
                if (part.mimeType === 'text/plain' && part.body && part.body.data) {
                    return Buffer.from(part.body.data, 'base64url').toString('utf-8');
                }
            }
            
            // Recursively search inside nested parts
            for (const part of parts) {
                if (part.parts) {
                    const found = getBody(part.parts);
                    if (found) return found;
                }
            }
            
            return '';
        };

        let body = '';
        if (payload.parts) {
            body = getBody(payload.parts);
        }
        if (!body && payload.body && payload.body.data) {
            body = Buffer.from(payload.body.data, 'base64url').toString('utf-8');
        }

        // Map attachments info
        const attachments = [];
        const findAttachments = (parts) => {
            if (!parts) return;
            for (const part of parts) {
                if (part.filename && part.body && part.body.attachmentId) {
                    attachments.push({
                        id: part.body.attachmentId,
                        filename: part.filename,
                        mimeType: part.mimeType,
                        size: part.body.size
                    });
                }
                if (part.parts) {
                    findAttachments(part.parts);
                }
            }
        };
        findAttachments(payload.parts);

        return {
            id: messageId,
            threadId: res.data.threadId,
            from,
            to,
            cc,
            bcc,
            subject,
            date,
            snippet: res.data.snippet,
            body,
            attachments
        };
    }

    async sendMessage(accessToken, { to, cc = [], bcc = [], subject, body, attachments = [] }) {
        const gmail = this.#getGmailClient(accessToken);
        
        const boundary = `qryptmail-boundary-${Date.now()}`;
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        
        const emailHeaders = [
            `To: ${to.join(', ')}`,
        ];
        if (cc && cc.length > 0) {
            emailHeaders.push(`Cc: ${cc.join(', ')}`);
        }
        if (bcc && bcc.length > 0) {
            emailHeaders.push(`Bcc: ${bcc.join(', ')}`);
        }
        emailHeaders.push(`Subject: ${utf8Subject}`);
        emailHeaders.push('MIME-Version: 1.0');
        
        let emailStr = '';
        if (attachments && attachments.length > 0) {
            emailHeaders.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
            emailStr += emailHeaders.join('\r\n') + '\r\n\r\n';
            
            // Text/HTML body part
            emailStr += `--${boundary}\r\n`;
            emailStr += 'Content-Type: text/html; charset=utf-8\r\n';
            emailStr += 'Content-Transfer-Encoding: base64\r\n\r\n';
            emailStr += Buffer.from(body).toString('base64') + '\r\n\r\n';
            
            // Attachment parts
            for (const att of attachments) {
                emailStr += `--${boundary}\r\n`;
                emailStr += `Content-Type: ${att.mimeType}; name="${att.filename}"\r\n`;
                emailStr += `Content-Disposition: attachment; filename="${att.filename}"\r\n`;
                emailStr += 'Content-Transfer-Encoding: base64\r\n\r\n';
                emailStr += att.content.replace(/^data:.*?;base64,/, '') + '\r\n\r\n'; // Strip data URI prefix if present
            }
            
            emailStr += `--${boundary}--`;
        } else {
            // Simple email
            emailHeaders.push('Content-Type: text/html; charset=utf-8');
            emailHeaders.push('Content-Transfer-Encoding: base64');
            emailStr += emailHeaders.join('\r\n') + '\r\n\r\n';
            emailStr += Buffer.from(body).toString('base64');
        }
        
        const raw = Buffer.from(emailStr)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const res = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw
            }
        });

        return {
            id: res.data.id,
            threadId: res.data.threadId
        };
    }

    /**
     * Create draft compiling a raw MIME message
     */
    async createDraft(accessToken, { to, subject, body }) {
        const gmail = this.#getGmailClient(accessToken);
        
        const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
        const emailLines = [
            `To: ${to.join(', ')}`,
            `Subject: ${utf8Subject}`,
            'Content-Type: text/plain; charset=utf-8',
            'MIME-Version: 1.0',
            '',
            body
        ];
        const emailStr = emailLines.join('\r\n');
        
        const raw = Buffer.from(emailStr)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        const res = await gmail.users.drafts.create({
            userId: 'me',
            requestBody: {
                message: { raw }
            }
        });

        return {
            id: res.data.id,
            message: res.data.message
        };
    }

    /**
     * Retrieve attachment binary block
     */
    async getAttachment(accessToken, messageId, attachmentId) {
        const gmail = this.#getGmailClient(accessToken);
        const res = await gmail.users.messages.attachments.get({
            userId: 'me',
            messageId,
            id: attachmentId
        }, {
            responseType: 'stream'
        });

        return res.data;
    }

    /**
     * Search emails by keywords/labels
     */
    async searchMessages(accessToken, query) {
        const gmail = this.#getGmailClient(accessToken);
        const res = await gmail.users.messages.list({
            userId: 'me',
            q: query
        });
        return res.data.messages || [];
    }
}
