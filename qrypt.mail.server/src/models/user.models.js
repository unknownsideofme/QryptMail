import { db } from '../config/database.js';
import { ObjectId } from 'mongodb';

export class User {
    /**
     * Create a new user document in MongoDB
     */
    static async create({ name, email, authProvider, providerUserId }) {
        const doc = {
            name,
            email: email.toLowerCase().trim(),
            authProvider,
            providerUserId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.query('users.insertOne', [doc]);
        return {
            _id: result.insertedId,
            ...doc
        };
    }

    /**
     * Find a user by ID
     */
    static async findById(id) {
        if (!id) return null;
        const queryId = typeof id === 'string' ? new ObjectId(id) : id;
        return db.query('users.findOne', [{ _id: queryId }]);
    }

    /**
     * Find a user by email
     */
    static async findByEmail(email) {
        if (!email) return null;
        return db.query('users.findOne', [{ email: email.toLowerCase().trim() }]);
    }

    /**
     * Find a user by their provider unique ID
     */
    static async findByProviderId(authProvider, providerUserId) {
        return db.query('users.findOne', [{ authProvider, providerUserId }]);
    }
}

export default User;
