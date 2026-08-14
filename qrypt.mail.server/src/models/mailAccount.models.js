import { db } from '../config/database.js';
import { ObjectId } from 'mongodb';

export class MailAccount {
    /**
     * Create a new connected mail account
     */
    static async create({ userId, provider, email, providerAccountId, accessToken, refreshToken, tokenExpiresAt }) {
        const uId = typeof userId === 'string' ? new ObjectId(userId) : userId;
        const doc = {
            userId: uId,
            provider,
            email: email.toLowerCase().trim(),
            providerAccountId,
            accessToken,
            refreshToken,
            tokenExpiresAt: tokenExpiresAt ? new Date(tokenExpiresAt) : null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.query('mail_accounts.insertOne', [doc]);
        return {
            _id: result.insertedId,
            ...doc
        };
    }

    /**
     * Find connected mail account by user and email
     */
    static async findByUserAndEmail(userId, email) {
        const uId = typeof userId === 'string' ? new ObjectId(userId) : userId;
        return db.query('mail_accounts.findOne', [{
            userId: uId,
            email: email.toLowerCase().trim()
        }]);
    }

    /**
     * Find all mail accounts connected to a specific user
     */
    static async findByUserId(userId) {
        const uId = typeof userId === 'string' ? new ObjectId(userId) : userId;
        return db.query('mail_accounts.find', [{ userId: uId }]);
    }

    /**
     * Update access and refresh tokens for a mail account
     */
    static async updateTokens(accountId, { accessToken, refreshToken, tokenExpiresAt }) {
        const id = typeof accountId === 'string' ? new ObjectId(accountId) : accountId;
        const updateFields = {
            accessToken,
            updatedAt: new Date()
        };
        if (refreshToken) updateFields.refreshToken = refreshToken;
        if (tokenExpiresAt) updateFields.tokenExpiresAt = new Date(tokenExpiresAt);

        return db.query('mail_accounts.updateOne', [
            { _id: id },
            { $set: updateFields }
        ]);
    }
}

export default MailAccount;