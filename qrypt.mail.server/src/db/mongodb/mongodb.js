import { MongoClient, ObjectId } from 'mongodb';
import Database from '../../interface/dbInterface/db.interface.js';

export default class MongoDatabase extends Database {
    #connectionString;
    #client;
    #dbName;

    constructor(connectionString = process.env.MONGODB_URI) {
        super();
        this.#connectionString = connectionString;
        this.#dbName = 'qryptmail'; // Default DB name

        if (connectionString) {
            try {
                const url = new URL(connectionString);
                const path = url.pathname.replace(/^\//, '');
                if (path) {
                    this.#dbName = path.split('?')[0];
                }
            } catch (err) {
                // Keep default dbName if connectionString is not a standard URL (e.g. mock strings)
            }
        }
    }

    /**
     * Connect to MongoDB Cluster qrypt0 and verify
     */
    async connect() {
        if (this.#client) return;

        if (!this.#connectionString) {
            throw new Error("MongoDB connection string (MONGODB_URI) is not configured in environment variables.");
        }

        try {
            this.#client = new MongoClient(this.#connectionString, { serverSelectionTimeoutMS: 3000 });
            await this.#client.connect();
            
            // Ping to confirm connection
            await this.#client.db(this.#dbName).command({ ping: 1 });
        } catch (err) {
            this.#client = null;
            throw new Error(`Failed to connect to MongoDB Cluster (qrypt0): ${err.message}`);
        }
    }

    /**
     * Disconnect client pool
     */
    async disconnect() {
        if (this.#client) {
            await this.#client.close();
            this.#client = null;
        }
    }

    /**
     * Execute generic MongoDB collection queries
     * @param {string} statement - Expected format: "collectionName.methodName" (e.g., "users.findOne")
     * @param {Array} params - Arguments list to pass to the collection method
     */
    async query(statement, params = []) {
        if (!this.#client) {
            throw new Error("Database not connected. Call connect() first.");
        }

        const parts = statement.split('.');
        if (parts.length !== 2) {
            throw new Error("Invalid MongoDB statement format. Expected 'collection.method' (e.g., 'users.findOne')");
        }

        const [collectionName, methodName] = parts;
        const db = this.#client.db(this.#dbName);
        const collection = db.collection(collectionName);

        if (typeof collection[methodName] !== 'function') {
            throw new Error(`MongoDB Collection method '${methodName}' does not exist.`);
        }

        const result = collection[methodName](...params);

        // Auto-convert cursors (like find, aggregate) to Arrays for ease of use
        if (result && typeof result.toArray === 'function') {
            return result.toArray();
        }

        return result;
    }

    /**
     * Find user by database unique ID
     */
    async findUserById(userId) {
        if (!userId) return null;
        const queryId = typeof userId === 'string' ? new ObjectId(userId) : userId;
        return this.query('users.findOne', [{ _id: queryId }]);
    }

    /**
     * Find user by provider credentials (stored directly in MongoDB users doc)
     */
    async findUserByProviderId(provider, providerAccountId) {
        return this.query('users.findOne', [{
            authProvider: provider,
            providerUserId: providerAccountId
        }]);
    }

    /**
     * Create user profile document
     */
    async createUser({ name, email, authProvider, providerUserId }) {
        const doc = {
            name,
            email: email.toLowerCase().trim(),
            authProvider,
            providerUserId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const res = await this.query('users.insertOne', [doc]);
        return {
            _id: res.insertedId,
            ...doc
        };
    }

    /**
     * Find mail account linked to a user by email address
     */
    async findMailAccountByUserAndEmail(userId, email) {
        const uId = typeof userId === 'string' ? new ObjectId(userId) : userId;
        return this.query('mail_accounts.findOne', [{
            userId: uId,
            email: email.toLowerCase().trim()
        }]);
    }

    /**
     * Link mail account credentials document
     */
    async createMailAccount({ userId, provider, email, providerAccountId, accessToken, refreshToken, tokenExpiresAt }) {
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
        const res = await this.query('mail_accounts.insertOne', [doc]);
        return {
            _id: res.insertedId,
            ...doc
        };
    }

    /**
     * Update access and refresh tokens
     */
    async updateMailAccountTokens(accountId, { accessToken, refreshToken, tokenExpiresAt }) {
        const id = typeof accountId === 'string' ? new ObjectId(accountId) : accountId;
        const updateFields = {
            accessToken,
            updatedAt: new Date()
        };
        if (refreshToken) updateFields.refreshToken = refreshToken;
        if (tokenExpiresAt) updateFields.tokenExpiresAt = new Date(tokenExpiresAt);

        return this.query('mail_accounts.updateOne', [
            { _id: id },
            { $set: updateFields }
        ]);
    }
}
