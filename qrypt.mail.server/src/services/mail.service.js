import { ProviderFactory } from '../providers/mail/provider.factory.js';
import authFactory from '../factory/authFactory/auth.factory.js';
import { db } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { errorFactories } from '../utils/errors.js';

const aFactory = new authFactory();

export default class MailService {
    /**
     * Ensures the mail account has a active access token (refreshes if close to expiry)
     * @param {string} userId 
     * @param {string} email 
     */
    static async getValidAccessToken(userId, email) {
        const account = await db.findMailAccountByUserAndEmail(userId, email);
        if (!account) {
            throw errorFactories.accountNotFound(`Linked email account "${email}" not found.`);
        }

        // Support both PostgreSQL snake_case and MongoDB camelCase values
        const accessToken = account.access_token || account.accessToken;
        const refreshToken = account.refresh_token || account.refreshToken;
        const rawExpires = account.token_expires_at || account.tokenExpiresAt;
        const expiresAt = rawExpires ? new Date(rawExpires) : null;

        const now = new Date();
        // If token expires in less than 5 minutes (or is already expired), trigger refresh
        if (expiresAt && (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000)) {
            logger.info(`Access token for ${email} is expired or close to expiry. Initiating refresh...`);
            
            if (!refreshToken) {
                throw errorFactories.authRequired('Refresh token is missing. Please re-authenticate your mail account.');
            }

            try {
                const authProvider = aFactory.getAuth(account.provider);
                const newTokens = await authProvider.refreshToken(refreshToken);
                
                // Update credentials in database (matching active DB interface keys)
                await db.updateMailAccountTokens(account._id || account.id, {
                    accessToken: newTokens.access_token,
                    refreshToken: newTokens.refresh_token,
                    tokenExpiresAt: newTokens.token_expires_at
                });
                
                logger.info(`Access token refreshed successfully for ${email}`);
                return newTokens.access_token;
            } catch (err) {
                logger.error(`Failed to refresh OAuth token for ${email}`, err);
                throw errorFactories.providerError(`Authentication session expired for ${email}. Please reconnect your account.`);
            }
        }

        return accessToken;
    }

    /**
     * Retrieve inbox messages
     */
    static async getInbox(userId, email, options = {}) {
        const account = await db.findMailAccountByUserAndEmail(userId, email);
        if (!account) {
            throw errorFactories.accountNotFound();
        }
        
        const accessToken = await this.getValidAccessToken(userId, email);
        const providerName = account.provider;
        const provider = ProviderFactory.getProvider(providerName);
        
        return provider.getInbox(accessToken, options);
    }

    /**
     * Retrieve full email message body and parts
     */
    static async getMessage(userId, email, messageId) {
        const account = await db.findMailAccountByUserAndEmail(userId, email);
        if (!account) {
            throw errorFactories.accountNotFound();
        }

        const accessToken = await this.getValidAccessToken(userId, email);
        const provider = ProviderFactory.getProvider(account.provider);
        
        return provider.getMessage(accessToken, messageId);
    }

    /**
     * Send email message
     */
    static async sendMessage(userId, email, { to, subject, body }) {
        const account = await db.findMailAccountByUserAndEmail(userId, email);
        if (!account) {
            throw errorFactories.accountNotFound();
        }

        const accessToken = await this.getValidAccessToken(userId, email);
        const provider = ProviderFactory.getProvider(account.provider);
        
        return provider.sendMessage(accessToken, { to, subject, body });
    }

    static async getAttachment(userId, email, messageId, attachmentId) {
        const account = await db.findMailAccountByUserAndEmail(userId, email);
        if (!account) {
            throw errorFactories.accountNotFound();
        }

        const accessToken = await this.getValidAccessToken(userId, email);
        const provider = ProviderFactory.getProvider(account.provider);
        
        return provider.getAttachment(accessToken, messageId, attachmentId);
    }
}
